-- Add image_urls array column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN image_urls TEXT[] DEFAULT '{}';

-- Migrate existing featured_image_url data to image_urls array
UPDATE public.blog_posts 
SET image_urls = CASE 
  WHEN featured_image_url IS NOT NULL AND featured_image_url != '' 
  THEN ARRAY[featured_image_url]
  ELSE '{}'::TEXT[]
END;

-- Drop the old featured_image_url column
ALTER TABLE public.blog_posts 
DROP COLUMN featured_image_url;