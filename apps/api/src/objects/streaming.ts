import type { ModelId } from "@kono/models";
import { type CoreMessage, type LanguageModelV1, streamText } from "ai";
import { DurableObject } from "cloudflare:workers";
import {
    type DrizzleSqliteDODatabase,
    drizzle,
} from "drizzle-orm/durable-sqlite";
// import { migrate } from "drizzle-orm/durable-sqlite/migrator";
// import { migrations } from "../../drizzle/migrations";
import { modelIdToLM } from "../utils/chat";

export interface StreamingSession {
    messageId: string;
    chatId: string;
    userId: string;
    model: LanguageModelV1;
    messageHistory: CoreMessage[];
    startTime: number;
    currentContent: string;
    status: "starting" | "streaming" | "completed" | "error" | "aborted";
    lastSaved: number;
    error?: string;
}

interface SerializedModel {
    modelId: ModelId;
    provider: string;
}

export class ChatDurableObject extends DurableObject<Cloudflare.Env> {
    storage: DurableObjectStorage;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    db: DrizzleSqliteDODatabase<any>;
    sessions: Map<string, StreamingSession> = new Map();

    // WebSocket connections for real-time updates
    webSockets: Map<string, WebSocket[]> = new Map();

    // Batching configuration
    private readonly BATCH_SIZE = 100; // chars before saving
    private readonly BATCH_TIMEOUT = 2000; // ms before forced save
    private batchTimers: Map<string, number> = new Map();

    constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
        super(ctx, env);
        this.storage = ctx.storage;
        this.db = drizzle(this.storage, { logger: false });

        // Make sure all migrations complete before accepting queries.
        // Otherwise you will need to run `this.migrate()` in any function
        // that accesses the Drizzle database `this.db`.
        ctx.blockConcurrencyWhile(async () => {
            await this._migrate();
        });
    }

    async _migrate() {
        // TODO: fix migrations
        // migrate(this.db, migrations);
    }

    async startStream(request: Request): Promise<Response> {
        try {
            const {
                messageId,
                chatId,
                userId,
                model: serializedModel,
                messageHistory,
            } = (await request.json()) as {
                messageId: string;
                chatId: string;
                userId: string;
                model: SerializedModel;
                messageHistory: CoreMessage[];
            };

            // Reconstruct the model from serialized form
            const model = modelIdToLM(serializedModel.modelId);
            if (!model) {
                return new Response(
                    `Model ${serializedModel.modelId} not found`,
                    { status: 400 },
                );
            }

            // Initialize session
            const session: StreamingSession = {
                messageId,
                chatId,
                userId,
                model,
                messageHistory,
                startTime: Date.now(),
                currentContent: "",
                status: "starting",
                lastSaved: Date.now(),
            };

            this.sessions.set(messageId, session);

            // Set up streaming response
            const { readable, writable } = new TransformStream();
            const writer = writable.getWriter();
            const encoder = new TextEncoder();

            // Start the streaming process
            this.handleStream(session, writer, encoder).catch((error) => {
                console.error(
                    `Streaming error for message ${messageId}:`,
                    error,
                );
                session.status = "error";
                session.error = error.message;
                writer.close();
            });

            return new Response(readable, {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
            });
        } catch (error) {
            console.error("Failed to start stream:", error);
            return new Response("Failed to start stream", { status: 500 });
        }
    }

    private async handleStream(
        session: StreamingSession,
        writer: WritableStreamDefaultWriter<Uint8Array>,
        encoder: TextEncoder,
    ): Promise<void> {
        let batchTimer: number | undefined;

        try {
            session.status = "streaming";

            // Initialize message in storage
            await this.saveMessageToStorage(session, true);

            // Start streaming from AI model
            const { textStream } = await streamText({
                model: session.model,
                system: "You are a helpful assistant.",
                messages: session.messageHistory,
            });

            let buffer = "";
            let lastSaveTime = Date.now();

            // Set up periodic save timer to handle cases where content comes slowly
            const setupBatchTimer = () => {
                if (batchTimer) clearTimeout(batchTimer);
                batchTimer = setTimeout(async () => {
                    if (buffer.length > 0 && session.status === "streaming") {
                        try {
                            await this.saveMessageToStorage(session);
                            buffer = "";
                            lastSaveTime = Date.now();
                            setupBatchTimer(); // Setup next timer
                        } catch (error) {
                            console.error(
                                `Batch save timer error for ${session.messageId}:`,
                                error,
                            );
                        }
                    }
                }, this.BATCH_TIMEOUT) as unknown as number;
            };

            setupBatchTimer();

            for await (const textPart of textStream) {
                // Check if session was aborted (can be changed externally via abortStream)
                const currentStatus = session.status;
                if (currentStatus !== "streaming") {
                    console.log(
                        `Stream interrupted for ${session.messageId}, status: ${currentStatus}`,
                    );
                    break;
                }

                // Update session content
                session.currentContent += textPart;
                buffer += textPart;

                // Write to stream immediately for low latency
                try {
                    await writer.write(encoder.encode(textPart));
                } catch (writeError) {
                    console.warn(
                        `Stream write failed for ${session.messageId}:`,
                        writeError,
                    );
                    // Client may have disconnected, but continue processing
                }

                // Broadcast to WebSocket clients (non-blocking)
                this.broadcastToWebSockets(session.messageId, textPart);

                // Batch save logic - prioritize size over time for responsiveness
                const now = Date.now();
                if (
                    buffer.length >= this.BATCH_SIZE ||
                    (buffer.length > 0 &&
                        now - lastSaveTime >= this.BATCH_TIMEOUT)
                ) {
                    try {
                        await this.saveMessageToStorage(session);
                        buffer = "";
                        lastSaveTime = now;
                        // Reset the timer since we just saved
                        setupBatchTimer();
                    } catch (saveError) {
                        console.error(
                            `Batch save error for ${session.messageId}:`,
                            saveError,
                        );
                        // Continue streaming even if save fails
                    }
                }
            }

            // Clear any pending timer
            if (batchTimer) clearTimeout(batchTimer);

            // Final save with any remaining buffer
            session.status = "completed";
            await this.saveMessageToStorage(session, true);

            // Clean up
            try {
                await writer.close();
            } catch (closeError) {
                console.warn(
                    `Writer close failed for ${session.messageId}:`,
                    closeError,
                );
            }

            this.cleanupSession(session.messageId);
        } catch (error) {
            // Clear timer on error
            if (batchTimer) clearTimeout(batchTimer);

            session.status = "error";
            session.error =
                error instanceof Error ? error.message : String(error);

            try {
                await this.saveMessageToStorage(session, true);
            } catch (saveError) {
                console.error(
                    `Failed to save error state for ${session.messageId}:`,
                    saveError,
                );
            }

            // Clean up even on error
            this.cleanupSession(session.messageId);
            throw error;
        }
    }

    private async saveMessageToStorage(
        session: StreamingSession,
        force = false,
    ): Promise<void> {
        try {
            const now = Date.now();

            // Skip if not enough time passed and not forced
            if (!force && now - session.lastSaved < 1000) {
                return;
            }

            // Save to durable object storage for immediate persistence
            await this.storage.put(`message:${session.messageId}`, {
                content: session.currentContent,
                status: session.status,
                generationTime: now - session.startTime,
                lastUpdated: now,
                error: session.error,
            });

            // Also save to D1 for long-term storage
            await this.syncToD1(session);

            session.lastSaved = now;
        } catch (error) {
            console.error(
                `Failed to save message ${session.messageId}:`,
                error,
            );
        }
    }

    private async syncToD1(session: StreamingSession): Promise<void> {
        // Get the main D1 database from environment
        const env = this.env as Cloudflare.Env & { DB?: D1Database };
        if (!env.DB) {
            console.warn("D1 database not available for sync");
            return;
        }

        try {
            // Use D1 prepared statement with optimistic locking
            // First check if the message exists and get current version
            const checkStmt = env.DB.prepare(`
                SELECT generation_time, status FROM messages WHERE id = ?
            `);

            const currentRecord = await checkStmt
                .bind(session.messageId)
                .first();
            const newGenerationTime = Date.now() - session.startTime;

            if (!currentRecord) {
                console.warn(
                    `Message ${session.messageId} not found in D1 for sync`,
                );
                return;
            }

            // Only update if we have newer content (avoid overwriting with older partial content)
            const currentGenerationTime =
                (currentRecord.generation_time as number) || 0;
            if (
                session.status === "completed" ||
                newGenerationTime > currentGenerationTime
            ) {
                const updateStmt = env.DB.prepare(`
                    UPDATE messages 
                    SET content = ?, status = ?, generation_time = ?, timestamp = ?
                    WHERE id = ? AND (generation_time <= ? OR status != 'completed')
                `);

                const result = await updateStmt
                    .bind(
                        session.currentContent,
                        session.status,
                        newGenerationTime,
                        new Date().toISOString(),
                        session.messageId,
                        newGenerationTime,
                    )
                    .run();

                if (!result.success) {
                    console.error(
                        `D1 update failed for ${session.messageId}:`,
                        result.error,
                    );
                }
            }
        } catch (error) {
            console.error(
                `Failed to sync to D1 for message ${session.messageId}:`,
                error,
            );
        }
    }

    private broadcastToWebSockets(messageId: string, chunk: string): void {
        const sockets = this.webSockets.get(messageId);
        if (!sockets) return;

        const message = JSON.stringify({
            type: "chunk",
            messageId,
            chunk,
            timestamp: Date.now(),
        });

        // Remove closed sockets and broadcast to active ones
        const activeSockets = sockets.filter((socket) => {
            if (socket.readyState === WebSocket.READY_STATE_OPEN) {
                try {
                    socket.send(message);
                    return true;
                } catch (error) {
                    console.error("Failed to send to WebSocket:", error);
                    return false;
                }
            }
            return false;
        });

        this.webSockets.set(messageId, activeSockets);
    }

    private cleanupSession(messageId: string): void {
        this.sessions.delete(messageId);
        this.webSockets.delete(messageId);

        const timer = this.batchTimers.get(messageId);
        if (timer) {
            clearTimeout(timer);
            this.batchTimers.delete(messageId);
        }
    }

    // Recovery method for handling dropped connections or partial streams
    async recoverStream(request: Request): Promise<Response> {
        const { messageId } = (await request.json()) as { messageId: string };

        // Check if there's an active session
        const session = this.sessions.get(messageId);
        if (session) {
            return Response.json({
                status: session.status,
                content: session.currentContent,
                recovered: false,
                message: "Active session found",
            });
        }

        // Try to recover from storage
        const stored = await this.storage.get(`message:${messageId}`);
        if (stored && typeof stored === "object") {
            const storedData = stored as {
                content: string;
                status: string;
                generationTime: number;
                lastUpdated: number;
                error?: string;
            };

            return Response.json({
                status: storedData.status,
                content: storedData.content,
                recovered: true,
                lastUpdated: storedData.lastUpdated,
                error: storedData.error,
            });
        }

        return new Response("Message not found for recovery", { status: 404 });
    }

    async abortStream(request: Request): Promise<Response> {
        const { messageId } = (await request.json()) as { messageId: string };

        const session = this.sessions.get(messageId);
        if (!session) {
            return new Response("Session not found", { status: 404 });
        }

        session.status = "aborted";
        await this.saveMessageToStorage(session, true);
        this.cleanupSession(messageId);

        return new Response("Stream aborted", { status: 200 });
    }

    async getStreamStatus(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const messageId = url.searchParams.get("messageId");

        if (!messageId) {
            return new Response("Message ID required", { status: 400 });
        }

        // Check active session first
        const session = this.sessions.get(messageId);
        if (session) {
            return Response.json({
                status: session.status,
                content: session.currentContent,
                generationTime: Date.now() - session.startTime,
                error: session.error,
            });
        }

        // Check storage
        const stored = await this.storage.get(`message:${messageId}`);
        if (stored) {
            return Response.json(stored);
        }

        return new Response("Message not found", { status: 404 });
    }

    async handleWebSocket(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const messageId = url.searchParams.get("messageId");

        if (!messageId) {
            return new Response("Message ID required", { status: 400 });
        }

        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        if (!server) {
            return new Response("Failed to create WebSocket", { status: 500 });
        }

        server.accept();

        // Add to active connections
        const sockets = this.webSockets.get(messageId) || [];
        sockets.push(server);
        this.webSockets.set(messageId, sockets);

        // Handle connection close
        server.addEventListener("close", () => {
            const currentSockets = this.webSockets.get(messageId) || [];
            const filtered = currentSockets.filter((s) => s !== server);
            this.webSockets.set(messageId, filtered);
        });

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        switch (url.pathname) {
            case "/start":
                return this.startStream(request);
            case "/abort":
                return this.abortStream(request);
            case "/status":
                return this.getStreamStatus(request);
            case "/ws":
                return this.handleWebSocket(request);
            case "/recover":
                return this.recoverStream(request);
            default:
                return new Response("Not found", { status: 404 });
        }
    }
}
