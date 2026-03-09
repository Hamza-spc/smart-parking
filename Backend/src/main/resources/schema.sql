-- =====================================================
-- Smart Parking System - Database Schema
-- MySQL Database: smartparking_db
-- =====================================================

CREATE DATABASE IF NOT EXISTS smartparking_db;
USE smartparking_db;

-- =====================================================
-- Table: users
-- =====================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: parkings
-- =====================================================
CREATE TABLE parkings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    total_slots INT NOT NULL,
    price_per_hour DOUBLE NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parkings_active (active),
    INDEX idx_parkings_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: parking_slots
-- =====================================================
CREATE TABLE parking_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slot_number VARCHAR(20) NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    slot_type ENUM('STANDARD', 'HANDICAPPED', 'VIP', 'ELECTRIC') NOT NULL DEFAULT 'STANDARD',
    floor VARCHAR(10),
    parking_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parking_id) REFERENCES parkings(id) ON DELETE CASCADE,
    INDEX idx_slots_parking (parking_id),
    INDEX idx_slots_status (status),
    INDEX idx_slots_parking_status (parking_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: reservations
-- =====================================================
CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    parking_slot_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    total_price DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parking_slot_id) REFERENCES parking_slots(id) ON DELETE CASCADE,
    INDEX idx_reservations_user (user_id),
    INDEX idx_reservations_slot (parking_slot_id),
    INDEX idx_reservations_status (status),
    INDEX idx_reservations_time (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: payments
-- =====================================================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_method ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'MOBILE_PAYMENT'),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_user (user_id),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Sample Data (Optional)
-- =====================================================

-- Insert admin user (password: admin123 - BCrypt encoded)
INSERT INTO users (full_name, email, password, phone, role)
VALUES ('Admin User', 'admin@smartparking.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '+212600000000', 'ADMIN');

-- Insert sample parking
INSERT INTO parkings (name, address, description, total_slots, price_per_hour, latitude, longitude)
VALUES
-- Central Medina & Jemaa el-Fna area
('Parking Jemaa el-Fna', 'Place Jemaa el-Fna, Medina, Marrakech', 'Central parking near Jemaa el-Fna square', 50, 10.0, 31.6258, -7.9891),
('Parking Riad Zitoun', 'Rue Riad Zitoun el Jdid, Medina, Marrakech', 'Street parking near Bahia Palace', 25, 7.0, 31.6210, -7.9860),
('Parking Bab Agnaou', 'Bab Agnaou, Medina, Marrakech', 'Outdoor parking near Kasbah', 40, 8.0, 31.6195, -7.9905),
('Parking Moulay El Yazid', 'Rue de la Kasbah, Medina, Marrakech', 'Parking near Saadian Tombs', 30, 6.0, 31.6180, -7.9930),
('Parking Koutoubia', 'Avenue Mohammed V, Medina, Marrakech', 'Large lot beside Koutoubia Mosque', 80, 10.0, 31.6240, -7.9935),

-- Gueliz (Modern City Center)
('Parking Gare Marrakech', 'Avenue Hassan II, Gueliz, Marrakech', 'Covered parking near Marrakech train station', 100, 8.0, 31.6325, -8.0149),
('Parking Carré Eden', 'Boulevard Mohammed V, Gueliz, Marrakech', 'Underground parking with EV charging at Carré Eden', 120, 12.0, 31.6367, -8.0082),
('Parking Plaza Marrakech', 'Avenue Mohammed V, Gueliz, Marrakech', 'Modern covered parking with 24h security', 80, 20.0, 31.6300, -7.9950),
('Parking Liberté', 'Place de la Liberté, Gueliz, Marrakech', 'Central Gueliz parking', 60, 10.0, 31.6350, -8.0050),
('Parking Bab Nkob', 'Rue de Yougoslavie, Gueliz, Marrakech', 'Street parking near Gueliz market', 35, 8.0, 31.6335, -8.0010),
('Parking 16 Novembre', 'Place du 16 Novembre, Gueliz, Marrakech', 'Underground parking in Gueliz center', 90, 12.0, 31.6360, -8.0100),

-- Hivernage
('Parking Hivernage', 'Avenue Echouhada, Hivernage, Marrakech', 'Secure parking in Hivernage district', 70, 15.0, 31.6220, -8.0100),
('Parking Palais des Congrès', 'Avenue de France, Hivernage, Marrakech', 'Parking near Congress Palace', 150, 15.0, 31.6200, -8.0060),
('Parking Royal Tennis', 'Rue du Temple, Hivernage, Marrakech', 'Parking near Royal Tennis Club', 45, 10.0, 31.6190, -8.0040),

-- Majorelle & Semlalia
('Parking Majorelle', 'Rue Yves Saint Laurent, Marrakech', 'Outdoor parking near Jardin Majorelle', 30, 5.0, 31.6417, -8.0032),
('Parking Semlalia', 'Avenue Yacoub El Mansour, Semlalia, Marrakech', 'Parking near Semlalia Hospital', 55, 7.0, 31.6380, -8.0150),

-- Menara & Mohammed VI
('Parking Menara Mall', 'Avenue Mohammed VI, Marrakech', 'Large covered parking at Menara Mall', 200, 15.0, 31.6340, -8.0280),
('Parking Menara Gardens', 'Avenue de la Menara, Marrakech', 'Open-air parking near Menara Gardens', 100, 5.0, 31.6250, -8.0220),
('Parking Al Mazar', 'Route de l\'Ourika, Marrakech', 'Covered parking at Al Mazar Mall', 180, 12.0, 31.6150, -7.9750),

-- Agdal & South
('Parking Royal Agdal', 'Avenue Mohammed VI, Agdal, Marrakech', 'Secure parking near Royal Palace Agdal', 40, 8.0, 31.6050, -7.9850),
('Parking Bab Jdid', 'Bab Jdid, Marrakech', 'Historical gate parking', 35, 6.0, 31.6190, -7.9980),
('Parking Bab Doukkala', 'Place Bab Doukkala, Marrakech', 'Large parking near Bab Doukkala gate', 60, 7.0, 31.6320, -7.9960),

-- Palmeraie & North
('Parking Palmeraie', 'Route de la Palmeraie, Marrakech', 'Parking in Palmeraie resort area', 50, 10.0, 31.6700, -8.0050),
('Parking Palmeraie Golf', 'Circuit de la Palmeraie, Marrakech', 'Parking near Palmeraie Golf Palace', 80, 15.0, 31.6650, -7.9900),

-- Route de Fès & Industrial
('Parking Targa', 'Route de Fès, Targa, Marrakech', 'Outdoor parking in Targa district', 45, 5.0, 31.6500, -7.9800),
('Parking Sidi Ghanem', 'Quartier Industriel Sidi Ghanem, Marrakech', 'Parking near Sidi Ghanem industrial zone', 70, 5.0, 31.6580, -8.0250),

-- Route de Casablanca
('Parking Marjane Ménara', 'Route de Casablanca, Marrakech', 'Supermarket parking near Menara', 120, 5.0, 31.6420, -8.0350),
('Parking Bab Ighli', 'Bab Ighli, Marrakech', 'Parking near Bab Ighli and Royal Palace', 30, 8.0, 31.6120, -7.9920),

-- Daoudiate & West
('Parking Daoudiate', 'Quartier Daoudiate, Marrakech', 'Residential area parking', 40, 5.0, 31.6450, -8.0200),
('Parking Massira', 'Quartier Massira, Marrakech', 'Public parking in Massira neighborhood', 50, 4.0, 31.6400, -8.0300);

-- Insert parking slots for first 6 parkings
-- Parking Jemaa el-Fna (id=1)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('A-01', 'AVAILABLE', 'STANDARD', '1', 1),
('A-02', 'AVAILABLE', 'STANDARD', '1', 1),
('A-03', 'AVAILABLE', 'HANDICAPPED', '1', 1),
('B-01', 'AVAILABLE', 'VIP', '2', 1),
('B-02', 'AVAILABLE', 'ELECTRIC', '2', 1);

-- Parking Riad Zitoun (id=2)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('RZ-01', 'AVAILABLE', 'STANDARD', '1', 2),
('RZ-02', 'AVAILABLE', 'STANDARD', '1', 2),
('RZ-03', 'OCCUPIED', 'STANDARD', '1', 2);

-- Parking Bab Agnaou (id=3)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('BA-01', 'AVAILABLE', 'STANDARD', '1', 3),
('BA-02', 'AVAILABLE', 'STANDARD', '1', 3),
('BA-03', 'AVAILABLE', 'VIP', '1', 3),
('BA-04', 'OCCUPIED', 'STANDARD', '1', 3);

-- Parking Moulay El Yazid (id=4)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('MY-01', 'AVAILABLE', 'STANDARD', '1', 4),
('MY-02', 'AVAILABLE', 'STANDARD', '1', 4),
('MY-03', 'AVAILABLE', 'HANDICAPPED', '1', 4);

-- Parking Koutoubia (id=5)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('KT-01', 'AVAILABLE', 'STANDARD', '1', 5),
('KT-02', 'AVAILABLE', 'STANDARD', '1', 5),
('KT-03', 'AVAILABLE', 'VIP', '1', 5),
('KT-04', 'AVAILABLE', 'ELECTRIC', '1', 5),
('KT-05', 'OCCUPIED', 'STANDARD', '1', 5);

-- Parking Gare Marrakech (id=6)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('G-01', 'AVAILABLE', 'STANDARD', '1', 6),
('G-02', 'AVAILABLE', 'STANDARD', '1', 6),
('G-03', 'AVAILABLE', 'VIP', '1', 6);

-- Parking Carré Eden (id=7)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('CE-01', 'AVAILABLE', 'ELECTRIC', '-1', 7),
('CE-02', 'AVAILABLE', 'ELECTRIC', '-1', 7),
('CE-03', 'AVAILABLE', 'STANDARD', '-2', 7),
('CE-04', 'AVAILABLE', 'VIP', '-2', 7),
('CE-05', 'OCCUPIED', 'STANDARD', '-2', 7);

-- Parking Plaza Marrakech (id=8)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('PM-01', 'AVAILABLE', 'VIP', '1', 8),
('PM-02', 'AVAILABLE', 'STANDARD', '1', 8),
('PM-03', 'AVAILABLE', 'HANDICAPPED', '1', 8),
('PM-04', 'OCCUPIED', 'STANDARD', '2', 8);

-- Parking Majorelle (id=16)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('MJ-01', 'AVAILABLE', 'STANDARD', '1', 16),
('MJ-02', 'AVAILABLE', 'STANDARD', '1', 16),
('MJ-03', 'OCCUPIED', 'STANDARD', '1', 16);

-- Parking Menara Mall (id=18)
INSERT INTO parking_slots (slot_number, status, slot_type, floor, parking_id) VALUES
('MM-01', 'AVAILABLE', 'STANDARD', '-1', 18),
('MM-02', 'AVAILABLE', 'STANDARD', '-1', 18),
('MM-03', 'AVAILABLE', 'VIP', '-2', 18),
('MM-04', 'AVAILABLE', 'ELECTRIC', '-2', 18),
('MM-05', 'OCCUPIED', 'STANDARD', '-2', 18);

