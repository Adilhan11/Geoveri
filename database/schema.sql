-- Veritabanını oluştur
CREATE DATABASE antalya_air_quality;

-- Veritabanına bağlan
\c antalya_air_quality

-- Gerekli uzantıları ekle
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Oteller tablosu
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    geom GEOMETRY(Point, 4326), -- EPSG:4326 = WGS84 koordinat sistemi
    address TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hava kirliliği ölçüm noktaları tablosu
CREATE TABLE air_quality_points (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    geom GEOMETRY(Point, 4326),
    pollution_level INTEGER CHECK (pollution_level >= 0 AND pollution_level <= 500),
    color VARCHAR(7) NOT NULL, -- Hex color code (#RRGGBB)
    measurement_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX idx_hotels_location ON hotels (latitude, longitude);
CREATE INDEX idx_air_quality_location ON air_quality_points (latitude, longitude);
CREATE INDEX idx_hotels_geom ON hotels USING GIST (geom);
CREATE INDEX idx_air_quality_geom ON air_quality_points USING GIST (geom);

-- Trigger fonksiyonu: lat/lon değiştiğinde geometriyi güncelle
CREATE OR REPLACE FUNCTION update_geom_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hotels tablosu için trigger
CREATE TRIGGER update_hotels_geom
    BEFORE INSERT OR UPDATE OF latitude, longitude
    ON hotels
    FOR EACH ROW
    EXECUTE FUNCTION update_geom_column();

-- Air quality points tablosu için trigger
CREATE TRIGGER update_air_quality_geom
    BEFORE INSERT OR UPDATE OF latitude, longitude
    ON air_quality_points
    FOR EACH ROW
    EXECUTE FUNCTION update_geom_column(); 