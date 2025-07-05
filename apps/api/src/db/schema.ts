import type { SharedMessages, TreeNode } from "@kono/models";
import { relations } from "drizzle-orm";
import {
    index,
    integer,
    numeric,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-typebox";
import { user } from "./auth-schema";

// Chat message table
export const messages = sqliteTable(
    "messages",
    {
        id: text("id").primaryKey(),
        status: text("status", {
            enum: [
                "ungenerated",
                "in_progress",
                "completed",
                "aborted",
                "error",
            ],
        }).notNull(),
        generationTime: numeric("generation_time", { mode: "number" }),
        role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
        content: text("content").notNull(),
        timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
        modelId: text("model_id").notNull(),
        parentId: text("parent_id"),
        chatId: text("chat_id")
            .notNull()
            .references(() => chats.id),
    },
    (table) => [
        index("status_idx").on(table.status),
        index("timestamp_idx").on(table.timestamp),
        uniqueIndex("model_id_idx").on(table.modelId),
        index("parent_id_idx").on(table.parentId),
        index("chat_id_idx").on(table.chatId),
    ],
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
    parent: one(messages, {
        fields: [messages.parentId],
        references: [messages.id],
    }),
    children: many(messages),
    chat: one(chats, {
        fields: [messages.chatId],
        references: [chats.id],
    }),
}));

export const messageSelectSchema = createSelectSchema(messages);
export const messageInsertSchema = createInsertSchema(messages);
export const messageUpdateSchema = createUpdateSchema(messages);

// Chat table
export const chats = sqliteTable(
    "chats",
    {
        id: text("id").primaryKey(),
        title: text("title"),
        creatorId: text("creator_id")
            .notNull()
            .references(() => user.id),
        createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
        lastUpdatedAt: integer("last_updated_at", {
            mode: "timestamp",
        }).notNull(),
    },
    (table) => [
        index("title_idx").on(table.title),
        index("creator_id_idx").on(table.creatorId),
        index("last_updated_at").on(table.lastUpdatedAt),
    ],
);

export const chatsRelations = relations(chats, ({ many }) => ({
    messages: many(messages),
}));

export const chatSelectSchema = createSelectSchema(chats);
export const chatInsertSchema = createInsertSchema(chats);
export const chatUpdateSchema = createUpdateSchema(chats);

// Shared chat table
export const sharedChats = sqliteTable("shared_chats", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title"),
    messagesJson: text("messages_json", { mode: "json" })
        .$type<SharedMessages>()
        .notNull(), // stores messages as JSON
    authorId: text("author_id")
        .notNull()
        .references(() => user.id),
    /** Expiry timestamp if it expires */
    expiresAt: integer("expires_at", { mode: "timestamp" }),
});

export const sharedChatsRelations = relations(sharedChats, ({ one }) => ({
    author: one(user, {
        fields: [sharedChats.authorId],
        references: [user.id],
    }),
}));

export const sharedChatSelectSchema = createSelectSchema(sharedChats);
export const sharedChatInsertSchema = createInsertSchema(sharedChats);
export const sharedChatUpdateSchema = createUpdateSchema(sharedChats);

// Tree node table (for chat trees)
export const treeNodes = sqliteTable("tree_nodes", {
    messageId: text("message_id")
        .primaryKey()
        .references(() => messages.id),
    chatId: text("chat_id")
        .notNull()
        .references(() => chats.id),
    childrenJson: text("children_json", { mode: "json" })
        .$type<TreeNode>()
        .notNull(), // stores children as JSON
    activeId: text("active_id").references(() => messages.id),
});

export const treeNodesRelations = relations(treeNodes, ({ one }) => ({
    message: one(messages, {
        fields: [treeNodes.messageId],
        references: [messages.id],
    }),
    chat: one(chats, {
        fields: [treeNodes.chatId],
        references: [chats.id],
    }),
}));

export const treeNodeSelectSchema = createSelectSchema(treeNodes);
export const treeNodeInsertSchema = createInsertSchema(treeNodes);
export const treeNodeUpdateSchema = createUpdateSchema(treeNodes);

export * from "./auth-schema";
