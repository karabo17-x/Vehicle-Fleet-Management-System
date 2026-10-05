-- =====================================================================
-- VFMS (Vehicle Fleet Management System) -- PostgreSQL schema
-- Generated from SQLAlchemy models in app/models/ and audit_service.py
-- =====================================================================

-- Enum types
CREATE TYPE driverstatus AS ENUM ('active', 'suspended', 'inactive');
CREATE TYPE vehiclestatus AS ENUM ('active', 'in_maintenance', 'retired');

-- audit_logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id VARCHAR(50) NOT NULL,
    actor_role VARCHAR(20) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(30) NOT NULL,
    resource_id VARCHAR(30) NOT NULL,
    detail TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- drivers
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    license_number VARCHAR(30) NOT NULL,
    license_expiry TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    status driverstatus NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ix_drivers_license_number ON drivers (license_number);

-- vehicles
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    status vehiclestatus NOT NULL DEFAULT 'active',
    insurance_expiry TIMESTAMP WITHOUT TIME ZONE,
    roadworthy_expiry TIMESTAMP WITHOUT TIME ZONE,
    current_driver_id INTEGER REFERENCES drivers (id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ix_vehicles_registration_number ON vehicles (registration_number);

-- assignments
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles (id),
    driver_id INTEGER NOT NULL REFERENCES drivers (id),
    assigned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    unassigned_at TIMESTAMP WITHOUT TIME ZONE,
    assigned_by VARCHAR(50) NOT NULL,
    unassigned_by VARCHAR(50)
);
CREATE INDEX ix_assignments_vehicle_id ON assignments (vehicle_id);
CREATE INDEX ix_assignments_driver_id ON assignments (driver_id);

-- maintenance_records
CREATE TABLE maintenance_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles (id),
    service_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC(10, 2) NOT NULL,
    service_provider VARCHAR(100),
    logged_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX ix_maintenance_records_vehicle_id ON maintenance_records (vehicle_id);

-- updated_at auto-refresh triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
