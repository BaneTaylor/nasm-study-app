-- Add ease_factor and interval columns to flashcard_progress
ALTER TABLE flashcard_progress ADD COLUMN IF NOT EXISTS ease_factor real DEFAULT 2.5;
ALTER TABLE flashcard_progress ADD COLUMN IF NOT EXISTS interval_days integer DEFAULT 0;

-- Add ease_factor and interval columns to question_progress
ALTER TABLE question_progress ADD COLUMN IF NOT EXISTS ease_factor real DEFAULT 2.5;
ALTER TABLE question_progress ADD COLUMN IF NOT EXISTS interval_days integer DEFAULT 0;
