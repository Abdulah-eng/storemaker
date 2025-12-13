-- Add sample templates (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Fashion Store') THEN
        INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) 
        VALUES ('Fashion Store', 'Modern and elegant template perfect for fashion brands', 'fashion', '', '', '{}', true, false, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Electronics Hub') THEN
        INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) 
        VALUES ('Electronics Hub', 'Clean tech-focused template for electronics stores', 'electronics', '', '', '{}', true, false, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Food & Restaurant') THEN
        INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) 
        VALUES ('Food & Restaurant', 'Appetizing template for restaurants', 'food', '', '', '{}', true, false, NOW(), NOW());
    END IF;
END $$;