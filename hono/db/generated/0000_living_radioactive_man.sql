CREATE TABLE `authenticator_number` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`email` varchar(255),
	`authenticator_number` varchar(255),
	`status` enum('utilized','waiting') DEFAULT 'waiting',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `authenticator_number_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_question` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_question` bigint unsigned,
	`comment` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comment_question_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_tool` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_tool` bigint unsigned,
	`comment` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comment_tool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`status` enum('read','unread') DEFAULT 'unread',
	`created_at` timestamp DEFAULT (now()),
	`json` json,
	CONSTRAINT `notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`name` varchar(255),
	`description` longtext,
	`data` json,
	`pipeline` json,
	`link` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pipeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`profile` enum('client','admin') DEFAULT 'client',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocol` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`name` varchar(255),
	`type` varchar(255),
	`doccument` longtext,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `protocol_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`question` varchar(255),
	`description` longtext,
	`resolved` enum('no','yes') DEFAULT 'no',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `question_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_tag` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_question` bigint unsigned,
	`id_tag` bigint unsigned,
	CONSTRAINT `question_tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_session` (
	`id` varchar(255) NOT NULL,
	`id_user` bigint unsigned,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `user_session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `star` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_tool` bigint unsigned,
	`number` int unsigned,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `star_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tag` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tag` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tool` varchar(255),
	`status` enum('active','inactive','waiting') DEFAULT 'inactive',
	`description` longtext,
	`article` longtext,
	`article_link` varchar(255),
	`contact` varchar(255),
	`website` varchar(255),
	`github` varchar(255),
	`tutorial` longtext,
	`update` datetime,
	`stars` int unsigned,
	`documentation` longtext,
	`development` varchar(255),
	`type` enum('analysis','visualization','prediction','other') DEFAULT 'other',
	`id_user` bigint unsigned,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_tag` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_tool` bigint unsigned,
	`id_tag` bigint unsigned,
	CONSTRAINT `tool_tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`last_name` varchar(255),
	`email` varchar(512),
	`status` enum('active','inactive') DEFAULT 'inactive',
	`hashed_password` varchar(255),
	`lang` enum('en-us','pt-br','es-es') DEFAULT 'en-us',
	`country` varchar(255),
	`institution` varchar(255),
	`type_specialist` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `authenticator_number` ADD CONSTRAINT `authenticator_number_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_question` ADD CONSTRAINT `comment_question_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_question` ADD CONSTRAINT `comment_question_id_question_question_id_fk` FOREIGN KEY (`id_question`) REFERENCES `question`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_tool` ADD CONSTRAINT `comment_tool_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_tool` ADD CONSTRAINT `comment_tool_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pipeline` ADD CONSTRAINT `pipeline_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile` ADD CONSTRAINT `profile_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `protocol` ADD CONSTRAINT `protocol_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_tag` ADD CONSTRAINT `question_tag_id_question_question_id_fk` FOREIGN KEY (`id_question`) REFERENCES `question`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_tag` ADD CONSTRAINT `question_tag_id_tag_tag_id_fk` FOREIGN KEY (`id_tag`) REFERENCES `tag`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_session` ADD CONSTRAINT `user_session_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `star` ADD CONSTRAINT `star_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `star` ADD CONSTRAINT `star_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool` ADD CONSTRAINT `tool_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_tag` ADD CONSTRAINT `tool_tag_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_tag` ADD CONSTRAINT `tool_tag_id_tag_tag_id_fk` FOREIGN KEY (`id_tag`) REFERENCES `tag`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `profile_idx` ON `profile` (`profile`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `user` (`email`);