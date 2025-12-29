-- Allow NULL job_id in transactions table
-- This enables transactions that are not associated with a specific job (e.g., day checkouts/returns)

ALTER TABLE transactions
ALTER COLUMN job_id DROP NOT NULL;

-- Optional: Add a comment to document this change
COMMENT ON COLUMN transactions.job_id IS 'Foreign key to jobs table. Can be NULL for standalone transactions not associated with a job.';
