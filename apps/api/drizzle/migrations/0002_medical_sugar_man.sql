PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`generation_time` numeric,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer NOT NULL,
	`model_id` text,
	`parent_id` text,
	`chat_id` text NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "status", "generation_time", "role", "content", "timestamp", "model_id", "parent_id", "chat_id") SELECT "id", "status", "generation_time", "role", "content", "timestamp", "model_id", "parent_id", "chat_id" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `status_idx` ON `messages` (`status`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `messages` (`timestamp`);--> statement-breakpoint
CREATE INDEX `parent_id_idx` ON `messages` (`parent_id`);--> statement-breakpoint
CREATE INDEX `chat_id_idx` ON `messages` (`chat_id`);