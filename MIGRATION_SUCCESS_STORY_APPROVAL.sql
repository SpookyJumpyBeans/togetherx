-- Add approval_status column to success_stories table
ALTER TABLE public.success_stories 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- Update existing stories to have pending status
UPDATE public.success_stories 
SET approval_status = 'pending' 
WHERE approval_status IS NULL;

-- Add constraint to ensure only valid statuses
ALTER TABLE public.success_stories 
ADD CONSTRAINT success_stories_approval_status_check 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));
