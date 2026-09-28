-- ============================================
-- Vehicle Fleet Management System (VFMS)
-- PostgreSQL Schema (reference — matches SQLAlchemy models)
-- Author: Thembeka Ne (47812036)
-- ============================================

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    insurance_expiry TIMESTAMP,
    roadworthy_expiry TIMESTAMP,
    current_driver_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_number ON vehicles(registration_number);

CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    assigned_by VARCHAR(50),
    unassigned_by VARCHAR(50),
    CONSTRAINT fk_assignment_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_driver
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_assignments_vehicle_id ON assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_driver_id ON assignments(driver_id);

ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_current_driver;
ALTER TABLE vehicles
    ADD CONSTRAINT fk_vehicles_current_driver
    FOREIGN KEY (current_driver_id) REFERENCES drivers(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS maintenance_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    service_date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    service_provider VARCHAR(100),
    logged_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON maintenance_records(vehicle_id);