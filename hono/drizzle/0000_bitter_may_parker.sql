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
CREATE TABLE `pathogen` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`pathogen` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pathogen_id` PRIMARY KEY(`id`)
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
	`title` varchar(255),
	`category` varchar(255),
	`description` longtext,
	`doi` json,
	`authors` longtext,
	`institution` varchar(255),
	`date` datetime,
	`validation` varchar(255),
	`estimated_time` varchar(255),
	`document` longtext,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`methodology` longtext,
	`materials` longtext,
	`troubleshooting` longtext,
	`protocol_type` varchar(255),
	CONSTRAINT `protocol_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocol_tag` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_protocol` bigint unsigned,
	`id_tag` bigint unsigned,
	CONSTRAINT `protocol_tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`question` varchar(255),
	`description` longtext,
	`resolved` enum('no','yes') DEFAULT 'no',
	`related_article` varchar(255),
	`related_tool` bigint unsigned,
	`related_protocol` bigint unsigned,
	`related_workflow` bigint unsigned,
	`related_use_case` bigint unsigned,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`type` enum('clinical','negative-result','publication','general') DEFAULT 'general',
	`clinical_unit` varchar(255),
	`region` varchar(255),
	`additional_info` longtext,
	`study_type` enum('in-vitro','in-vivo','computational','clinical') DEFAULT 'clinical',
	`sample_size` int unsigned,
	`working_hypothesis` longtext,
	`conclusions` longtext,
	`authors` longtext,
	`journal` varchar(255),
	`doi` varchar(255),
	`abstract` longtext,
	`year` int unsigned,
	`scope` longtext,
	`target_audience` longtext,
	`graphical_abstract` longtext,
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
CREATE TABLE `star_tool` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_tool` bigint unsigned,
	`number` int unsigned,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `star_tool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suggestion_tool` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tool` varchar(255),
	`description` longtext,
	`website` varchar(255),
	`github` varchar(255),
	`contact` varchar(255),
	`is_developer` varchar(255),
	CONSTRAINT `suggestion_tool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveillance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`title` longtext,
	`description` longtext,
	`severity` enum('critical','watch','info') DEFAULT 'critical',
	`bacterium` varchar(255),
	`resistance` varchar(255),
	`location` json,
	`facility` varchar(255),
	`date` datetime,
	`reported_by` varchar(255),
	`isolates_count` int unsigned,
	`antibiotics` json,
	`status` enum('monitoring','resolved','closed') DEFAULT 'monitoring',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`antibiogram` json,
	`event_type` enum('isolated','cluster','suspected_outbreak','confirmed_outbreak','regional_emergency') DEFAULT 'isolated',
	`environment` enum('community','hospital','icu','outpatient','other') DEFAULT 'community',
	`sample_origin` enum('blood_culture','urine','swab','respiratory_secretion','csf','other') DEFAULT 'blood_culture',
	`detection_date` datetime,
	`event_start_date` datetime,
	`event_end_date` datetime,
	`detection_type` enum('phenotypic','pcr','wgs','other') DEFAULT 'phenotypic',
	`certainty_degree` enum('lab_confirmed','preliminary_data','clinical_report','sequencing_in_progress') DEFAULT 'lab_confirmed',
	`use_suggested_severity` enum('yes','no') DEFAULT 'yes',
	`manual_severity` enum('info','watch','critical') DEFAULT 'info',
	`institution` varchar(255),
	CONSTRAINT `surveillance_id` PRIMARY KEY(`id`)
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
	`install` longtext,
	`code` longtext,
	`site_doc` varchar(255),
	`update` datetime,
	`version` varchar(255),
	`stars` int unsigned,
	`documentation` longtext,
	`development` varchar(255),
	`type` enum('analysis','visualization','prediction','other') DEFAULT 'other',
	`id_user` bigint unsigned,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`authors` longtext,
	`doi` varchar(255),
	`dataset_examples_json` json,
	`output_examples_json` json,
	`input_formats` json,
	`execution_time` enum('fast','medium','slow') DEFAULT 'medium',
	`compute_requirements` enum('light','medium','heavy') DEFAULT 'medium',
	`programming_language` varchar(255),
	`database` enum('yes','no') DEFAULT 'no',
	CONSTRAINT `tool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_pathogen` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_tool` bigint unsigned,
	`id_pathogen` bigint unsigned,
	CONSTRAINT `tool_pathogen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_rating` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_tool` bigint unsigned,
	`rating` int unsigned,
	`comment` longtext,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tool_rating_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_tag` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_tool` bigint unsigned,
	`id_tag` bigint unsigned,
	CONSTRAINT `tool_tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_user` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_tool` bigint unsigned,
	`id_user` bigint unsigned,
	`name` varchar(255),
	`institution` varchar(255),
	`location` json,
	`type` enum('student','researcher','lab','other') DEFAULT 'other',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tool_user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `use_case` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`description` longtext,
	`recommended_tools` json,
	`step_by_step_guide` longtext,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`id_user` bigint unsigned,
	CONSTRAINT `use_case_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `use_case_rating` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_use_case` bigint unsigned,
	`rating` int unsigned,
	`comment` longtext,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `use_case_rating_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `use_case_user` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_use_case` bigint unsigned,
	`id_user` bigint unsigned,
	`name` varchar(255),
	`institution` varchar(255),
	`location` json,
	`type` enum('student','researcher','lab','other') DEFAULT 'other',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `use_case_user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`last_name` varchar(255),
	`email` varchar(512),
	`description` longtext,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`hashed_password` varchar(255),
	`lang` enum('en-us','pt-br','es-es') DEFAULT 'en-us',
	`country` varchar(255),
	`institution` varchar(255),
	`type_specialist` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`position` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `vote_comment_question` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_question` bigint unsigned,
	`id_comment` bigint unsigned,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vote_comment_question_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vote_question` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_question` bigint unsigned,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vote_question_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`description` longtext,
	`tool_sequence` json,
	`id_user` bigint unsigned,
	`rating` double unsigned,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`pipeline` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_rating` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_user` bigint unsigned,
	`id_workflow` bigint unsigned,
	`rating` int unsigned,
	`comment` longtext,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_rating_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_tag` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_workflow` bigint unsigned,
	`id_tag` bigint unsigned,
	CONSTRAINT `workflow_tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_user` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`id_workflow` bigint unsigned,
	`id_user` bigint unsigned,
	`name` varchar(255),
	`institution` varchar(255),
	`location` json,
	`type` enum('student','researcher','lab','other') DEFAULT 'other',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_user_id` PRIMARY KEY(`id`)
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
ALTER TABLE `protocol_tag` ADD CONSTRAINT `protocol_tag_id_protocol_protocol_id_fk` FOREIGN KEY (`id_protocol`) REFERENCES `protocol`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `protocol_tag` ADD CONSTRAINT `protocol_tag_id_tag_tag_id_fk` FOREIGN KEY (`id_tag`) REFERENCES `tag`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_related_tool_tool_id_fk` FOREIGN KEY (`related_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_related_protocol_protocol_id_fk` FOREIGN KEY (`related_protocol`) REFERENCES `protocol`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_related_workflow_workflow_id_fk` FOREIGN KEY (`related_workflow`) REFERENCES `workflow`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question` ADD CONSTRAINT `question_related_use_case_use_case_id_fk` FOREIGN KEY (`related_use_case`) REFERENCES `use_case`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_tag` ADD CONSTRAINT `question_tag_id_question_question_id_fk` FOREIGN KEY (`id_question`) REFERENCES `question`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_tag` ADD CONSTRAINT `question_tag_id_tag_tag_id_fk` FOREIGN KEY (`id_tag`) REFERENCES `tag`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_session` ADD CONSTRAINT `user_session_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `star` ADD CONSTRAINT `star_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `star` ADD CONSTRAINT `star_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `star_tool` ADD CONSTRAINT `star_tool_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `star_tool` ADD CONSTRAINT `star_tool_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `surveillance` ADD CONSTRAINT `surveillance_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool` ADD CONSTRAINT `tool_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_pathogen` ADD CONSTRAINT `tool_pathogen_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_pathogen` ADD CONSTRAINT `tool_pathogen_id_pathogen_pathogen_id_fk` FOREIGN KEY (`id_pathogen`) REFERENCES `pathogen`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_rating` ADD CONSTRAINT `tool_rating_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_rating` ADD CONSTRAINT `tool_rating_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_tag` ADD CONSTRAINT `tool_tag_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_tag` ADD CONSTRAINT `tool_tag_id_tag_tag_id_fk` FOREIGN KEY (`id_tag`) REFERENCES `tag`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_user` ADD CONSTRAINT `tool_user_id_tool_tool_id_fk` FOREIGN KEY (`id_tool`) REFERENCES `tool`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_user` ADD CONSTRAINT `tool_user_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `use_case` ADD CONSTRAINT `use_case_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `use_case_rating` ADD CONSTRAINT `use_case_rating_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `use_case_rating` ADD CONSTRAINT `use_case_rating_id_use_case_use_case_id_fk` FOREIGN KEY (`id_use_case`) REFERENCES `use_case`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `use_case_user` ADD CONSTRAINT `use_case_user_id_use_case_use_case_id_fk` FOREIGN KEY (`id_use_case`) REFERENCES `use_case`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `use_case_user` ADD CONSTRAINT `use_case_user_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vote_comment_question` ADD CONSTRAINT `vote_comment_question_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vote_comment_question` ADD CONSTRAINT `vote_comment_question_id_question_question_id_fk` FOREIGN KEY (`id_question`) REFERENCES `question`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vote_comment_question` ADD CONSTRAINT `vote_comment_question_id_comment_comment_question_id_fk` FOREIGN KEY (`id_comment`) REFERENCES `comment_question`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vote_question` ADD CONSTRAINT `vote_question_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vote_question` ADD CONSTRAINT `vote_question_id_question_question_id_fk` FOREIGN KEY (`id_question`) REFERENCES `question`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow` ADD CONSTRAINT `workflow_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_rating` ADD CONSTRAINT `workflow_rating_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_rating` ADD CONSTRAINT `workflow_rating_id_workflow_workflow_id_fk` FOREIGN KEY (`id_workflow`) REFERENCES `workflow`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_tag` ADD CONSTRAINT `workflow_tag_id_workflow_workflow_id_fk` FOREIGN KEY (`id_workflow`) REFERENCES `workflow`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_tag` ADD CONSTRAINT `workflow_tag_id_tag_tag_id_fk` FOREIGN KEY (`id_tag`) REFERENCES `tag`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_user` ADD CONSTRAINT `workflow_user_id_workflow_workflow_id_fk` FOREIGN KEY (`id_workflow`) REFERENCES `workflow`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_user` ADD CONSTRAINT `workflow_user_id_user_user_id_fk` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `profile_idx` ON `profile` (`profile`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `user` (`email`);