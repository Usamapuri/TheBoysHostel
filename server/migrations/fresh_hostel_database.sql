-- THE BOYS HOSTEL - Fresh Database Initialization
-- This script creates a clean database from scratch

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS common_room_bookings CASCADE;
DROP TABLE IF EXISTS common_rooms CASCADE;
DROP TABLE IF EXISTS cafe_order_items CASCADE;
DROP TABLE IF EXISTS cafe_orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS site CASCADE;

-- Create enums
CREATE TYPE user_role AS ENUM ('tenant', 'cafe_manager', 'hostel_team', 'hostel_admin');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled', 'deleted');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed');
CREATE TYPE site AS ENUM ('blue_area', 'i_10', 'both');

-- Create users table (tenants and staff)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  site site NOT NULL DEFAULT 'blue_area',
  room_type TEXT DEFAULT 'shared_room',
  room_number TEXT,
  credits INTEGER DEFAULT 30,
  used_credits DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP DEFAULT NOW(),
  bio TEXT,
  linkedin_url TEXT,
  profile_image TEXT,
  job_title TEXT,
  company TEXT,
  community_visible BOOLEAN DEFAULT TRUE,
  email_visible BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  rfid_number TEXT,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create menu categories table
CREATE TABLE menu_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  site site NOT NULL DEFAULT 'blue_area'
);

-- Create menu items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INTEGER REFERENCES menu_categories(id),
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_daily_special BOOLEAN DEFAULT FALSE,
  site site NOT NULL DEFAULT 'blue_area',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create cafe orders table
CREATE TABLE cafe_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  handled_by INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  payment_status TEXT DEFAULT 'unpaid',
  payment_updated_by INTEGER REFERENCES users(id),
  payment_updated_at TIMESTAMP,
  notes TEXT,
  delivery_location TEXT,
  site site NOT NULL DEFAULT 'blue_area',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create cafe order items table
CREATE TABLE cafe_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES cafe_orders(id) NOT NULL,
  menu_item_id INTEGER REFERENCES menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Create common rooms table
CREATE TABLE common_rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  credit_cost_per_hour INTEGER NOT NULL,
  amenities TEXT[],
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  site site NOT NULL DEFAULT 'blue_area',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create common room bookings table
CREATE TABLE common_room_bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  room_id INTEGER REFERENCES common_rooms(id) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  credits_used DECIMAL(10, 2) NOT NULL,
  status booking_status DEFAULT 'confirmed',
  notes TEXT,
  cancelled_by INTEGER REFERENCES users(id),
  site site NOT NULL DEFAULT 'blue_area',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  show_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  site site NOT NULL DEFAULT 'blue_area',
  sites TEXT[] DEFAULT ARRAY['blue_area'],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_cafe_orders_user_id ON cafe_orders(user_id);
CREATE INDEX idx_cafe_orders_status ON cafe_orders(status);
CREATE INDEX idx_cafe_orders_created_at ON cafe_orders(created_at);
CREATE INDEX idx_common_room_bookings_user_id ON common_room_bookings(user_id);
CREATE INDEX idx_common_room_bookings_room_id ON common_room_bookings(room_id);
CREATE INDEX idx_common_room_bookings_start_time ON common_room_bookings(start_time);

-- Insert default admin user
-- Email: admin@theboyshostel.com
-- Password: admin123 (CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!)
INSERT INTO users (email, password, first_name, last_name, role, site, credits, is_active, onboarding_completed)
VALUES (
  'admin@theboyshostel.com',
  '$2b$10$rZ3qVfK9kBKvXO7kzE4Hzu.6QmXE5yM0qX7ZzQYcX9Kx3qZrJNfXG', -- Password: admin123
  'Admin',
  'User',
  'hostel_admin',
  'blue_area',
  0,
  TRUE,
  TRUE
);

-- Insert sample menu categories
INSERT INTO menu_categories (name, description, display_order, site) VALUES
('Breakfast', 'Start your day right', 1, 'blue_area'),
('Lunch', 'Hearty midday meals', 2, 'blue_area'),
('Dinner', 'Evening favorites', 3, 'blue_area'),
('Snacks', 'Quick bites', 4, 'blue_area'),
('Beverages', 'Hot and cold drinks', 5, 'blue_area');

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category_id, site) VALUES
('Paratha with Omelette', 'Fresh paratha with 2-egg omelette', 150, 1, 'blue_area'),
('Halwa Puri', 'Traditional breakfast platter', 200, 1, 'blue_area'),
('Chicken Biryani', 'Aromatic rice with tender chicken', 350, 2, 'blue_area'),
('Karahi Chicken', 'Spicy chicken curry', 400, 3, 'blue_area'),
('Samosa (2pcs)', 'Crispy vegetable samosas', 80, 4, 'blue_area'),
('Chai', 'Traditional milk tea', 50, 5, 'blue_area'),
('Cold Drink', 'Assorted soft drinks', 80, 5, 'blue_area');

-- Insert sample common rooms
INSERT INTO common_rooms (name, description, capacity, credit_cost_per_hour, amenities, site) VALUES
('TV Lounge', 'Main TV room with comfortable seating', 15, 1, ARRAY['TV', 'AC', 'Sofas'], 'blue_area'),
('Study Room', 'Quiet study area with desks', 8, 1, ARRAY['WiFi', 'AC', 'Whiteboard'], 'blue_area'),
('Gaming Room', 'Recreation room with games', 10, 2, ARRAY['TV', 'PlayStation', 'AC'], 'blue_area'),
('Conference Room', 'For group discussions', 12, 2, ARRAY['Projector', 'WiFi', 'AC', 'Whiteboard'], 'blue_area');

-- Insert welcome announcement
INSERT INTO announcements (title, body, is_active, site, sites) VALUES
('Welcome to THE BOYS HOSTEL!', 
 'We hope you have a comfortable stay. Please check the cafe menu and book common rooms as needed. For any issues, contact the admin.',
 TRUE,
 'blue_area',
 ARRAY['blue_area', 'i_10']);

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ THE BOYS HOSTEL database initialized successfully!';
  RAISE NOTICE '📊 Created tables: users, menu_categories, menu_items, cafe_orders, cafe_order_items, common_rooms, common_room_bookings, announcements';
  RAISE NOTICE '👤 Default admin: admin@theboyshostel.com (password: admin123 - CHANGE THIS!)';
  RAISE NOTICE '🍔 Sample menu items added';
  RAISE NOTICE '🏠 Sample common rooms added';
END $$;

