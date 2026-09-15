-- ============================================================
-- AI SMART WASTE REDISTRIBUTION PLATFORM
-- Database Schema for Module 1: AI-Based Surplus Item Analysis
-- Database System: MySQL 8.0+
-- ============================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS waste_redistribution_db;
USE waste_redistribution_db;

-- ------------------------------------------------------------
-- Table 1: donors
-- Stores registered donor accounts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table 2: items
-- Stores surplus items submitted by donors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table 3: analysis_results
-- Stores AI analysis outputs for each surplus item
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL UNIQUE,
    predicted_category VARCHAR(50) NOT NULL,
    item_condition VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    confidence DOUBLE NOT NULL,
    estimated_shelf_life VARCHAR(100),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Sample Seed Data for Testing
-- ------------------------------------------------------------
INSERT INTO donors (name, email, password, phone, location)
VALUES ('Demo Donor', 'donor@example.com', 'password123', '9876543210', 'Bangalore, India')
ON DUPLICATE KEY UPDATE name=VALUES(name);
