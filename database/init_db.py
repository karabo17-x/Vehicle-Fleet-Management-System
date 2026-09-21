# database/init_db.py
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection(include_db=True):
    """Create a connection to MySQL"""
    config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD') or None,
        'port': int(os.getenv('DB_PORT', 3306))
    }
    if include_db:
        config['database'] = os.getenv('DB_NAME', 'vehicle_fleet_db')
    return mysql.connector.connect(**config)

def create_database():
    """Create the database if it doesn't exist"""
    print(" Checking database...")
    conn = get_connection(include_db=False)
    cursor = conn.cursor()
    
    db_name = os.getenv('DB_NAME', 'vehicle_fleet_db')
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    print("Database '{db_name}' is ready")
    
    cursor.close()
    conn.close()

def create_tables():
    """Create all tables in the database"""
    print(" Creating tables...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. VEHICLES
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            vehicleID INT PRIMARY KEY AUTO_INCREMENT,
            reg_Number VARCHAR(20) NOT NULL UNIQUE,
            model VARCHAR(100) NOT NULL,
            year INT NOT NULL,
            status ENUM('Active', 'Inactive', 'Under Maintenance', 'Retired') DEFAULT 'Active',
            insurance_expiry DATE,
            roadworthy_expiry DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print(" Table 'vehicles' created")
    
    # 2. DRIVERS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS drivers (
            driverID INT PRIMARY KEY AUTO_INCREMENT,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            licence_number VARCHAR(20) NOT NULL UNIQUE,
            licence_expiry DATE NOT NULL,
            phone_number VARCHAR(15),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Table 'drivers' created")
    
    # 3. ASSIGNMENTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assignments (
            assignmentID INT PRIMARY KEY AUTO_INCREMENT,
            vehicleID INT NOT NULL,
            driverID INT NOT NULL,
            assigned_date DATE NOT NULL,
            unassigned_date DATE,
            FOREIGN KEY (vehicleID) REFERENCES vehicles(vehicleID) ON DELETE CASCADE,
            FOREIGN KEY (driverID) REFERENCES drivers(driverID) ON DELETE CASCADE
        )
    """)
    print("Table 'assignments' created")
    
    # 4. MAINTENANCE_LOGS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS maintenance_logs (
            maintenanceID INT PRIMARY KEY AUTO_INCREMENT,
            vehicleID INT NOT NULL,
            service_date DATE NOT NULL,
            cost DECIMAL(10, 2) NOT NULL,
            description TEXT NOT NULL,
            service_type VARCHAR(50),
            FOREIGN KEY (vehicleID) REFERENCES vehicles(vehicleID) ON DELETE CASCADE
        )
    """)
    print("Table 'maintenance_logs' created")
    
    # 5. EXPIRY_ALERTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expiry_alerts (
            alertID INT PRIMARY KEY AUTO_INCREMENT,
            vehicleID INT,
            driverID INT,
            alert_type ENUM('Insurance', 'Roadworthy', 'Licence') NOT NULL,
            expiry_date DATE NOT NULL,
            is_notified BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (vehicleID) REFERENCES vehicles(vehicleID) ON DELETE CASCADE,
            FOREIGN KEY (driverID) REFERENCES drivers(driverID) ON DELETE CASCADE
        )
    """)
    print("Table 'expiry_alerts' created")
    
    conn.commit()
    cursor.close()
    conn.close()
    print("\n ALL TABLES CREATED SUCCESSFULLY!")

def main():
    print("=" * 50)
    print("VEHICLE FLEET DB - DATABASE SETUP")
    print("=" * 50)
    
    if not os.path.exists('.env'):
        print(" WARNING: .env file not found in the current folder!")
        print("   Please create a .env file in the ROOT folder (not inside database/)")
        return
    
    create_database()
    create_tables()

if __name__ == "__main__":
    main()