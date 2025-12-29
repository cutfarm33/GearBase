# Database Migrations

## How to Apply Migrations

These SQL migration files need to be run in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste and execute the SQL

## Available Migrations

### allow_null_job_id.sql

**Purpose:** Allows transactions to exist without being associated with a job.

**Why:** This fixes the issue where items checked out for the day (not part of a specific job) cannot be returned. The previous schema required all transactions to have a job_id, which caused a foreign key constraint error when trying to return items that weren't associated with a job.

**Changes:**
- Modifies the `transactions` table to allow `NULL` values for the `job_id` column
- Adds documentation comment explaining when job_id can be null

**Run this if:** You're getting the error "violates foreign key constraint 'transactions_job_id_fkey'" when returning items.
