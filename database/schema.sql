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
-- Table 4: receivers
-- Stores receiver / NGO accounts for donation requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receivers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(200),
    organization_name VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table 5: donation_requests
-- Stores receiver requests and pickup coordination status
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donation_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    donor_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    note VARCHAR(1000),
    pickup_location VARCHAR(250),
    pickup_scheduled_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_donation_request_item_status (item_id, status),
    INDEX idx_donation_request_receiver (receiver_id, created_at),
    INDEX idx_donation_request_donor (donor_id, created_at),
    CONSTRAINT fk_donation_request_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT fk_donation_request_receiver FOREIGN KEY (receiver_id) REFERENCES receivers(id) ON DELETE CASCADE,
    CONSTRAINT fk_donation_request_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table 6: notifications
-- Persists status and pickup updates for receivers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receiver_id BIGINT NOT NULL,
    donation_request_id BIGINT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notification_receiver_created (receiver_id, created_at),
    CONSTRAINT fk_notification_receiver FOREIGN KEY (receiver_id) REFERENCES receivers(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_request FOREIGN KEY (donation_request_id) REFERENCES donation_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table 7: sessions
-- Stores authenticated donor and receiver sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    user_type VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sessions_user (user_id, user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Sample Seed Data for Testing
-- ------------------------------------------------------------
INSERT INTO donors (name, email, password, phone, location)
VALUES ('Demo Donor', 'donor@example.com', 'password123', '9876543210', 'Bangalore, India')
ON DUPLICATE KEY UPDATE name=VALUES(name);
