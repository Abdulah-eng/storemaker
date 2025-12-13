-- Add working templates with complete configurations
DO $$
BEGIN
    -- Fashion Store Template
    IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Luxe Fashion') THEN
        INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) 
        VALUES (
            'Luxe Fashion',
            'Elegant fashion template with clean layouts and premium feel',
            'fashion',
            '/templates/luxe-fashion/preview.jpg',
            '/templates/luxe-fashion/thumb.jpg',
            '{
                "colors": {
                    "primary": "#1a1a1a",
                    "secondary": "#f5f5f5",
                    "accent": "#d4af37",
                    "text": "#333333",
                    "background": "#ffffff"
                },
                "fonts": {
                    "heading": "Playfair Display",
                    "body": "Source Sans Pro"
                },
                "layout": {
                    "header": "clean",
                    "hero": "full-width",
                    "product_grid": "3-column",
                    "footer": "minimal"
                },
                "components": {
                    "hero": {
                        "title": "Discover Luxury Fashion",
                        "subtitle": "Curated collection of premium clothing",
                        "cta": "Shop Collection",
                        "background": "gradient-dark"
                    },
                    "features": [
                        {"icon": "shipping", "title": "Free Shipping", "desc": "On orders over $100"},
                        {"icon": "returns", "title": "Easy Returns", "desc": "30-day return policy"},
                        {"icon": "quality", "title": "Premium Quality", "desc": "Carefully selected materials"}
                    ]
                }
            }',
            true,
            false,
            NOW(),
            NOW()
        );
    END IF;
    
    -- Electronics Store Template
    IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Tech Hub') THEN
        INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) 
        VALUES (
            'Tech Hub',
            'Modern electronics store with tech-focused design',
            'electronics',
            '/templates/tech-hub/preview.jpg',
            '/templates/tech-hub/thumb.jpg',
            '{
                "colors": {
                    "primary": "#2563eb",
                    "secondary": "#f8fafc",
                    "accent": "#10b981",
                    "text": "#1f2937",
                    "background": "#ffffff"
                },
                "fonts": {
                    "heading": "Inter",
                    "body": "Inter"
                },
                "layout": {
                    "header": "modern",
                    "hero": "split-layout",
                    "product_grid": "4-column",
                    "footer": "detailed"
                },
                "components": {
                    "hero": {
                        "title": "Latest Tech Gadgets",
                        "subtitle": "Cutting-edge technology at your fingertips",
                        "cta": "Explore Products",
                        "background": "tech-gradient"
                    },
                    "features": [
                        {"icon": "warranty", "title": "2-Year Warranty", "desc": "Comprehensive coverage"},
                        {"icon": "support", "title": "24/7 Support", "desc": "Expert technical help"},
                        {"icon": "delivery", "title": "Fast Delivery", "desc": "Same-day in major cities"}
                    ]
                }
            }',
            true,
            false,
            NOW(),
            NOW()
        );
    END IF;
    
    -- Food & Restaurant Template
    IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Gourmet Kitchen') THEN
        INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) 
        VALUES (
            'Gourmet Kitchen',
            'Appetizing restaurant template with food-focused design',
            'food',
            '/templates/gourmet-kitchen/preview.jpg',
            '/templates/gourmet-kitchen/thumb.jpg',
            '{
                "colors": {
                    "primary": "#dc2626",
                    "secondary": "#fef2f2",
                    "accent": "#f59e0b",
                    "text": "#1f2937",
                    "background": "#ffffff"
                },
                "fonts": {
                    "heading": "Merriweather",
                    "body": "Open Sans"
                },
                "layout": {
                    "header": "restaurant",
                    "hero": "food-focus",
                    "product_grid": "menu-style",
                    "footer": "contact-heavy"
                },
                "components": {
                    "hero": {
                        "title": "Authentic Gourmet Experience",
                        "subtitle": "Fresh ingredients, traditional recipes",
                        "cta": "View Menu",
                        "background": "food-hero"
                    },
                    "features": [
                        {"icon": "fresh", "title": "Fresh Daily", "desc": "Ingredients sourced daily"},
                        {"icon": "chef", "title": "Expert Chefs", "desc": "Michelin-trained culinary team"},
                        {"icon": "delivery", "title": "Quick Delivery", "desc": "Hot food in 30 minutes"}
                    ]
                }
            }',
            true,
            false,
            NOW(),
            NOW()
        );
    END IF;
    
    -- Beauty & Cosmetics Template
    IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Beauty Boutique') THEN
        INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) 
        VALUES (
            'Beauty Boutique',
            'Elegant beauty store with luxury cosmetics focus',
            'beauty',
            '/templates/beauty-boutique/preview.jpg',
            '/templates/beauty-boutique/thumb.jpg',
            '{
                "colors": {
                    "primary": "#ec4899",
                    "secondary": "#fdf2f8",
                    "accent": "#8b5cf6",
                    "text": "#374151",
                    "background": "#ffffff"
                },
                "fonts": {
                    "heading": "Poppins",
                    "body": "Nunito Sans"
                },
                "layout": {
                    "header": "beauty",
                    "hero": "beauty-focus",
                    "product_grid": "beauty-grid",
                    "footer": "social-heavy"
                },
                "components": {
                    "hero": {
                        "title": "Discover Your Beauty",
                        "subtitle": "Premium cosmetics for every skin type",
                        "cta": "Shop Now",
                        "background": "beauty-gradient"
                    },
                    "features": [
                        {"icon": "natural", "title": "Natural Ingredients", "desc": "Organic and cruelty-free"},
                        {"icon": "expert", "title": "Beauty Experts", "desc": "Professional consultation"},
                        {"icon": "rewards", "title": "Loyalty Rewards", "desc": "Earn points with every purchase"}
                    ]
                }
            }',
            true,
            true,
            NOW(),
            NOW()
        );
    END IF;
    
    -- Minimalist Template
    IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'Clean Minimal') THEN
        INSERT INTO templates (name, description, category, preview_url, thumbnail_url, config, is_active, is_premium, created_at, updated_at) 
        VALUES (
            'Clean Minimal',
            'Ultra-clean minimalist design for any product type',
            'general',
            '/templates/clean-minimal/preview.jpg',
            '/templates/clean-minimal/thumb.jpg',
            '{
                "colors": {
                    "primary": "#000000",
                    "secondary": "#f9fafb",
                    "accent": "#6b7280",
                    "text": "#111827",
                    "background": "#ffffff"
                },
                "fonts": {
                    "heading": "Inter",
                    "body": "Inter"
                },
                "layout": {
                    "header": "minimal",
                    "hero": "minimal-hero",
                    "product_grid": "minimal-grid",
                    "footer": "minimal"
                },
                "components": {
                    "hero": {
                        "title": "Less is More",
                        "subtitle": "Carefully curated products",
                        "cta": "Explore",
                        "background": "minimal"
                    },
                    "features": [
                        {"icon": "quality", "title": "Quality First", "desc": "Handpicked selection"},
                        {"icon": "simple", "title": "Simple Shopping", "desc": "Effortless experience"},
                        {"icon": "sustainable", "title": "Sustainable", "desc": "Eco-friendly choices"}
                    ]
                }
            }',
            true,
            false,
            NOW(),
            NOW()
        );
    END IF;
END $$;