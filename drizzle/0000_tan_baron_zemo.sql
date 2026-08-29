CREATE TABLE `mobile_media` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`scenic_id` text NOT NULL,
	`kind` text NOT NULL,
	`style` text NOT NULL,
	`mime` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_mobile_media_user` ON `mobile_media` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `mobile_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`role` text NOT NULL,
	`city` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mobile_visits` (
	`user_id` text NOT NULL,
	`scenic_id` text NOT NULL,
	`listened` text DEFAULT '[]' NOT NULL,
	`checked_at` text,
	`answers` text DEFAULT '[]' NOT NULL,
	`quiz_score` integer,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `scenic_id`)
);
