-- Veritabanını oluştur
CREATE DATABASE antalya_air_quality;

-- Veritabanına bağlan
\c antalya_air_quality

-- Gerekli uzantıları ekle
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Oteller tablosu
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hava kirliliği ölçüm noktaları tablosu
CREATE TABLE air_quality_points (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    pollution_level INTEGER CHECK (pollution_level >= 0 AND pollution_level <= 500),
    color VARCHAR(7) NOT NULL, -- Hex color code (#RRGGBB)
    measurement_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX idx_hotels_location ON hotels (latitude, longitude);
CREATE INDEX idx_air_quality_location ON air_quality_points (latitude, longitude); 