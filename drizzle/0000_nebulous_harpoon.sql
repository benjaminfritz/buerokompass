CREATE TABLE `job_state` (
	`owner` text NOT NULL,
	`job_id` text NOT NULL,
	`seen` integer DEFAULT 0 NOT NULL,
	`favorite` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`owner`, `job_id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`location` text NOT NULL,
	`source` text NOT NULL,
	`employment` text NOT NULL,
	`salary` text NOT NULL,
	`added_at` text NOT NULL,
	`kind` text NOT NULL
);
