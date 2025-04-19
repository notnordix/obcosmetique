-- Create database
CREATE DATABASE IF NOT EXISTS ob_cosmetique;
USE ob_cosmetique;

-- Enable UTF-8 character set
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create view_counter table
CREATE TABLE IF NOT EXISTS view_counter (
  id INT PRIMARY KEY AUTO_INCREMENT,
  count INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial view count
INSERT INTO view_counter (count) VALUES (0);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255) NOT NULL,
  description TEXT,
  fullDescription TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create product_images table (for multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id VARCHAR(36) PRIMARY KEY,
  productId VARCHAR(36) NOT NULL,
  imageUrl VARCHAR(255) NOT NULL,
  displayOrder INT NOT NULL DEFAULT 0,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Create product_ingredients table
CREATE TABLE IF NOT EXISTS product_ingredients (
  id VARCHAR(36) PRIMARY KEY,
  productId VARCHAR(36) NOT NULL,
  ingredient VARCHAR(255) NOT NULL,
  displayOrder INT NOT NULL DEFAULT 0,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Create product_translations table
CREATE TABLE IF NOT EXISTS product_translations (
  id VARCHAR(36) PRIMARY KEY,
  productId VARCHAR(36) NOT NULL,
  lang VARCHAR(5) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  fullDescription TEXT,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY (productId, lang)
);

-- Create ingredient_translations table
CREATE TABLE IF NOT EXISTS ingredient_translations (
  id VARCHAR(36) PRIMARY KEY,
  productId VARCHAR(36) NOT NULL,
  lang VARCHAR(5) NOT NULL,
  ingredient VARCHAR(255) NOT NULL,
  displayOrder INT NOT NULL DEFAULT 0,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  customerName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  status ENUM('processing', 'completed') NOT NULL DEFAULT 'processing',
  total DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
);

-- Create admin_users table with hashed passwords
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (username: ouzobcosmetique, password: wail@ouztechnology)
-- Note: This is a bcrypt hash of the password, which can be compared in TypeScript using bcrypt.compare()
INSERT INTO admin_users (id, username, passwordHash) 
VALUES (UUID(), 'ouzobcosmetique', '$2b$10$wosHfDLETsxn69rIuYCf7eCZHawE1eHP80r8AgHqt6nyAp7SA1Rru');