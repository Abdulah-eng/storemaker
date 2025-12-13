-- Run these commands in PostgreSQL (psql or pgAdmin)

-- Create database
CREATE DATABASE storemaker;

-- Create user (if needed)
-- CREATE USER postgres WITH PASSWORD 'password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE storemaker TO postgres;

-- Connect to the database
\c storemaker;

-- The Go application will automatically create tables on first run