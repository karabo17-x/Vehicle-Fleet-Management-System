-- ============================================
-- Vehicle Fleet Management System (VFMS)
-- PostgreSQL Schema
-- Mirrors SQLAlchemy models in backend/app/models/
-- Author: Thembeka Ne (47812036) - Database Engineer
-- ============================================

-- ============================================
-- ENUM TYPES (mirror Python Enums in app/models/)
-- ============================================
CREATE TYPE vehicle_status AS ENUM ('active', 'in_maintenance', 'retired');
CREATE TYPE driver_status  AS ENUM ('active', 'inactive', 'suspended');

-- ============================================
-- 1. DRIVERS
-- Mirrors backend/app/models/driver.py
-- ============================================
CREATE TABLE IF NOT EXISTS drivers (
    id               SERIAL PRIMARY KEY,
    first_name       VARCHAR(20)   NOT NULL,
    last_name        VARCHAR(20)   NOT NULL,
    license_number   VARCHAR(30)   NOT NULL UNIQUE,
    license_expiry   TIMESTAMP     NOT NULL,
    phone            VARCHAR(15),
    email            VARCHAR(30),
    status           driver_status NOT NULL DEFAULT 'active',
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_drivers_license_expiry
    ON drivers(license_expiry);

-- ============================================
-- 2. VEHICLES
-- Mirrors backend/app/models/vehicle.py
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
	id                  SERIAL PRIMARY KEY,
	registration_number VARCHAR(20)     NOT NULL UNIQUE,
	make                VARCHAR(50)     NOT NULL,
	model               VARCHAR(50)     NOT NULL,
	year                INTEGER         NOT NULL,
	status              vehicle_status  NOT NULL DEFAULT 'active',
	insurance_expiry    TIMESTAMP,
	roadworthy_expiry   TIMESTAMP,
	current_driver_id   INTEGER,
	created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_vehicles_current_driver
		FOREIGN KEY (current_driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_registration_number
	ON vehicles(registration_number);

-- ============================================
-- 3. ASSIGNMENTS
-- Mirrors backend/app/models/assignment.py
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
	id             SERIAL PRIMARY KEY,
	vehicle_id     INTEGER NOT NULL,
	driver_id      INTEGER NOT NULL,
	assigned_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	unassigned_at  TIMESTAMP,
	assigned_by    VARCHAR(50),
	unassigned_by  VARCHAR(50),
	CONSTRAINT fk_assignments_vehicle
		FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
	CONSTRAINT fk_assignments_driver
		FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assignments_vehicle_id ON assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_driver_id  ON assignments(driver_id);

-- ============================================
-- 4. MAINTENANCE_RECORDS
-- Mirrors backend/app/models/maintenance.py
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_records (
	id                SERIAL PRIMARY KEY,
	vehicle_id        INTEGER       NOT NULL,
	service_date      TIMESTAMP     NOT NULL,
	description       TEXT          NOT NULL,
	cost              NUMERIC(10,2) NOT NULL DEFAULT 0.00,
	service_provider  VARCHAR(100),
	logged_by         VARCHAR(50),
	created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_maintenance_vehicle
		FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id
	ON maintenance_records(vehicle_id);

-- ============================================
-- 5. AUDIT_LOGS
-- Write-only log written on every create / update / delete / assign.
-- No SQLAlchemy model — kept as raw SQL per team decision.
-- Columns supplied by Karabo (Security & DevOps lead).
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
	id             SERIAL PRIMARY KEY,
	actor_id       VARCHAR(50)  NOT NULL,
	actor_role     VARCHAR(20)  NOT NULL,
	action         VARCHAR(20)  NOT NULL,
	resource_type  VARCHAR(50)  NOT NULL,
	resource_id    INTEGER      NOT NULL,
	detail         TEXT,
	created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
	ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
	ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
	ON audit_logs(created_at);
