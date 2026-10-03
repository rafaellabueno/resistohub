CREATE TABLE `deletion_log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`entity_type` varchar(255),
	`entity_id` bigint unsigned,
	`deleted_by` bigint unsigned,
	`payload` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `deletion_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `deletion_log` ADD CONSTRAINT `deletion_log_deleted_by_user_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;