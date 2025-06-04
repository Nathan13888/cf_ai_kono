import { Type, type Static } from "@sinclair/typebox";
import { messageIdSchema } from "./message";

export const treeNodeSchema = Type.Recursive(This => Type.Object({
    messageId: messageIdSchema,
    children: Type.Record(messageIdSchema, This),
    /** ID of active children */
    activeId: messageIdSchema,
}), { $id: "TreeNode" });
export type TreeNode = Static<typeof treeNodeSchema>;

// class ProgressiveConversationTree {
//   private nodes = new Map<string, TreeNode>();
//   private roots = new Map<string, TreeNode>();
//   private loadBatch: (parentId: string | null, offset: number, limit: number) => Promise<MessageBatch>;

//   constructor(loadBatch: (parentId: string | null, offset: number, limit: number) => Promise<MessageBatch>) {
//     this.loadBatch = loadBatch;
//   }

//   // Extremely fast deserialization - direct Map population from JSON
//   deserializeBatch(batch: MessageBatch): void {
//     const newNodes: TreeNode[] = [];

//     // First pass: create all nodes
//     for (const message of batch.messages) {
//       if (this.nodes.has(message.id)) continue; // Skip if already exists

//       const node: TreeNode = {
//         message,
//         children: new Map(),
//         hasUnloadedChildren: batch.hasMore[message.id] || false,
//         totalChildCount: batch.childCounts[message.id] || 0,
//         loadedChildCount: 0
//       };

//       this.nodes.set(message.id, node);
//       newNodes.push(node);

//       // Track roots
//       if (message.parentId === null) {
//         this.roots.set(message.id, node);
//       }
//     }

//     // Second pass: link parent-child relationships
//     for (const node of newNodes) {
//       const parentId = node.message.parentId;
//       if (parentId && this.nodes.has(parentId)) {
//         const parent = this.nodes.get(parentId)!;
//         parent.children.set(node.message.id, node);
//         parent.loadedChildCount++;
//       }
//     }
//   }

//   // O(1) append new child anywhere in tree
//   appendChild(parentId: string, newMessage: Message): boolean {
//     const parent = this.nodes.get(parentId);
//     if (!parent) return false;

//     // Create new node
//     const childNode: TreeNode = {
//       message: { ...newMessage, parentId },
//       children: new Map(),
//       hasUnloadedChildren: false,
//       totalChildCount: 0,
//       loadedChildCount: 0
//     };

//     // Link to parent
//     parent.children.set(newMessage.id, childNode);
//     parent.loadedChildCount++;
//     parent.totalChildCount++;

//     // Add to global index
//     this.nodes.set(newMessage.id, childNode);

//     return true;
//   }

//   // Efficient progressive loading
//   async loadMoreChildren(parentId: string | null, limit = 20): Promise<Message[]> {
//     const parent = parentId ? this.nodes.get(parentId) : null;
//     const currentOffset = parent ? parent.loadedChildCount : this.roots.size;

//     const batch = await this.loadBatch(parentId, currentOffset, limit);
//     this.deserializeBatch(batch);

//     return batch.messages;
//   }

//   // Get immediate children (already loaded)
//   getChildren(parentId: string): TreeNode[] {
//     const parent = this.nodes.get(parentId);
//     return parent ? Array.from(parent.children.values()) : [];
//   }

//   // Get root messages
//   getRoots(): TreeNode[] {
//     return Array.from(this.roots.values());
//   }

//   // Check if node has more children to load
//   hasMoreChildren(parentId: string): boolean {
//     const parent = this.nodes.get(parentId);
//     return parent ? parent.hasUnloadedChildren : false;
//   }

//   // Get loading progress for a parent
//   getChildrenProgress(parentId: string): { loaded: number; total: number } {
//     const parent = this.nodes.get(parentId);
//     return parent 
//       ? { loaded: parent.loadedChildCount, total: parent.totalChildCount }
//       : { loaded: 0, total: 0 };
//   }

//   // Efficient tree traversal with callback
//   traverse(callback: (node: TreeNode, depth: number) => void, startFromRoots = true): void {
//     const traverse = (nodes: TreeNode[], depth: number) => {
//       for (const node of nodes) {
//         callback(node, depth);
//         if (node.children.size > 0) {
//           traverse(Array.from(node.children.values()), depth + 1);
//         }
//       }
//     };

//     if (startFromRoots) {
//       traverse(Array.from(this.roots.values()), 0);
//     }
//   }

//   // Get path from root to specific message
//   getPath(messageId: string): TreeNode[] {
//     const path: TreeNode[] = [];
//     let current = this.nodes.get(messageId);

//     while (current) {
//       path.unshift(current);
//       const parentId = current.message.parentId;
//       current = parentId ? this.nodes.get(parentId) : null;
//     }

//     return path;
//   }

//   // Bulk operations for efficiency
//   bulkAppendChildren(operations: Array<{ parentId: string; message: Message }>): boolean[] {
//     return operations.map(op => this.appendChild(op.parentId, op.message));
//   }

//   // Get tree statistics
//   getStats(): { totalNodes: number; totalRoots: number; averageDepth: number } {
//     let totalDepth = 0;
//     let nodeCount = 0;

//     this.traverse((node, depth) => {
//       totalDepth += depth;
//       nodeCount++;
//     });

//     return {
//       totalNodes: this.nodes.size,
//       totalRoots: this.roots.size,
//       averageDepth: nodeCount > 0 ? totalDepth / nodeCount : 0
//     };
//   }
// }

// // Usage example:
// class ConversationAPI {
//   private tree: ProgressiveConversationTree;

//   constructor() {
//     this.tree = new ProgressiveConversationTree(this.loadMessageBatch.bind(this));
//   }

//   private async loadMessageBatch(parentId: string | null, offset: number, limit: number): Promise<MessageBatch> {
//     // Simulate API call
//     const response = await fetch(`/api/messages?parentId=${parentId}&offset=${offset}&limit=${limit}`);
//     return response.json();
//   }

//   // Initialize with root messages
//   async initialize(): Promise<void> {
//     await this.tree.loadMoreChildren(null, 50); // Load first 50 root messages
//   }

//   // Load more replies for a specific message
//   async loadMoreReplies(messageId: string): Promise<Message[]> {
//     return this.tree.loadMoreChildren(messageId, 20);
//   }

//   // Add new message anywhere in tree
//   async sendReply(parentId: string, content: string, authorId: string): Promise<boolean> {
//     const newMessage: Message = {
//       id: crypto.randomUUID(),
//       content,
//       authorId,
//       timestamp: Date.now(),
//       parentId
//     };

//     // Optimistically add to tree
//     const success = this.tree.appendChild(parentId, newMessage);
    
//     if (success) {
//       // Send to server
//       await fetch('/api/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newMessage)
//       });
//     }

//     return success;
//   }

//   getTree(): ProgressiveConversationTree {
//     return this.tree;
//   }
// }

// TODO: Verify everything in this file ^
