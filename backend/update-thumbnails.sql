-- Update template thumbnails to use proper placeholder images
-- This will fix the 404 errors for thumb.jpg files

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
WHERE category = 'beauty' AND (thumbnail_url = '' OR thumbnail_url IS NULL OR thumbnail_url LIKE '%thumb.jpg%');

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
WHERE category = 'fashion' AND (thumbnail_url = '' OR thumbnail_url IS NULL OR thumbnail_url LIKE '%thumb.jpg%');

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop'
WHERE category = 'electronics' AND (thumbnail_url = '' OR thumbnail_url IS NULL OR thumbnail_url LIKE '%thumb.jpg%');

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1504674900244-1b47f22f8f54?w=400&h=300&fit=crop'
WHERE category = 'food' AND (thumbnail_url = '' OR thumbnail_url IS NULL OR thumbnail_url LIKE '%thumb.jpg%');

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'
WHERE category = 'general' AND (thumbnail_url = '' OR thumbnail_url IS NULL OR thumbnail_url LIKE '%thumb.jpg%');

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
WHERE category = 'home' AND (thumbnail_url = '' OR thumbnail_url IS NULL OR thumbnail_url LIKE '%thumb.jpg%');

-- Update any remaining templates with empty or problematic thumbnail URLs
UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'
WHERE thumbnail_url = '' OR thumbnail_url IS NULL OR thumbnail_url LIKE '%thumb.jpg%';

-- Show the results
SELECT id, name, category, thumbnail_url FROM templates ORDER BY category, name; 