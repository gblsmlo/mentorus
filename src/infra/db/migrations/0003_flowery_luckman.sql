-- Drop the existing default
ALTER TABLE "resume" ALTER COLUMN "competencies" DROP DEFAULT;-->statement-breakpoint
-- Convert competencies from JSONB to text[] 
ALTER TABLE "resume" ALTER COLUMN "competencies" TYPE text[] USING (
  CASE 
    WHEN "competencies" IS NULL THEN '{}'::text[]
    WHEN jsonb_typeof("competencies") = 'array' THEN 
      translate("competencies"::text, '[]"', '{}')::text[]
    ELSE '{}'::text[]
  END
);-->statement-breakpoint
-- Set new default
ALTER TABLE "resume" ALTER COLUMN "competencies" SET DEFAULT '{}';-->statement-breakpoint
-- Drop about column
ALTER TABLE "resume" DROP COLUMN "about";