ALTER TABLE "resume" ALTER COLUMN "competencies" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "competencies" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "resume" DROP COLUMN "about";