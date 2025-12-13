-- Sample templates for StoreMaker platform
-- Run this after database migration to add sample data

INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) VALUES 
(
    'Fashion Store',
    'A modern and elegant template perfect for fashion and clothing stores',
    'fashion',
    '/templates/fashion/preview.jpg',
    '/templates/fashion/thumb.jpg',
    '{"colors": {"primary": "#1f2937", "secondary": "#f3f4f6"}, "layout": "modern", "features": ["hero_section", "product_grid", "testimonials"]}',
    true,
    false,
    NOW(),
    NOW()
),
(
    'Electronics Hub',
    'Clean and tech-focused template for electronics and gadgets',
    'electronics', 
    '/templates/electronics/preview.jpg',
    '/templates/electronics/thumb.jpg',
    '{"colors": {"primary": "#3b82f6", "secondary": "#e5e7eb"}, "layout": "grid", "features": ["product_showcase", "specifications", "reviews"]}',
    true,
    false,
    NOW(),
    NOW()
),
(
    'Food & Restaurant',
    'Appetizing template for restaurants and food delivery services',
    'food',
    '/templates/food/preview.jpg', 
    '/templates/food/thumb.jpg',
    '{"colors": {"primary": "#dc2626", "secondary": "#fef2f2"}, "layout": "classic", "features": ["menu_display", "booking", "gallery"]}',
    true,
    false,
    NOW(),
    NOW()
),
(
    'Beauty & Cosmetics',
    'Elegant and luxurious template for beauty and cosmetics brands',
    'beauty',
    '/templates/beauty/preview.jpg',
    '/templates/beauty/thumb.jpg', 
    '{"colors": {"primary": "#ec4899", "secondary": "#fdf2f8"}, "layout": "luxury", "features": ["product_carousel", "before_after", "testimonials"]}',
    true,
    true,
    NOW(),
    NOW()
),
(
    'Home & Garden',
    'Warm and inviting template for home decor and garden supplies',
    'home',
    '/templates/home/preview.jpg',
    '/templates/home/thumb.jpg',
    '{"colors": {"primary": "#059669", "secondary": "#ecfdf5"}, "layout": "cozy", "features": ["room_showcase", "seasonal_products", "diy_guides"]}',
    true,
    false,
    NOW(),
    NOW()
),
(
    'General Store', 
    'Versatile template suitable for any type of online store',
    'general',
    '/templates/general/preview.jpg',
    '/templates/general/thumb.jpg',
    '{"colors": {"primary": "#6366f1", "secondary": "#f8fafc"}, "layout": "flexible", "features": ["multi_category", "search", "filters"]}',
    true,
    false,
    NOW(),
    NOW()
);

-- Create a sample admin user
INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES 
(
    'admin@storemaker.com',
    '$2a$10$LFcN1BPtXYuWd5ngF9KBz.kvx65XJ/NZATRM5qOrzIZ6A1HPJ50uK', -- password: admin123
    'Admin',
    'User', 
    'admin',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;