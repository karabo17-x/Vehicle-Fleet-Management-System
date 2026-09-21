# database/seed_data.py
import mysql.connector
import os
from datetime import date
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD') or None,
        database=os.getenv('DB_NAME', 'vehicle_fleet_db'),
        port=int(os.getenv('DB_PORT', 3306))
    )

def seed_vehicles(cursor):
    vehicles = [
        ("ABC-1234", "Toyota Hilux", 2020, "Active", date(2026, 12, 31), date(2026, 10, 15)),
        ("XYZ-5678", "Ford Transit", 2021, "Active", date(2027, 1, 15), date(2026, 11, 20)),
        ("DEF-9012", "Mercedes Sprinter", 2019, "Under Maintenance", date(2026, 9, 1), date(2026, 8, 1)),
        ("GHI-3456", "Nissan Navara", 2022, "Active", date(2027, 6, 30), date(2027, 3, 15)),
        ("JKL-7890", "Volkswagen Crafter", 2020, "Retired", date(2025, 12, 31), date(2025, 10, 1)),
    ]
    cursor.executemany("""
        INSERT IGNORE INTO vehicles (reg_Number, model, year, status, insurance_expiry, roadworthy_expiry)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, vehicles)
    print(" Inserted {len(vehicles)} vehicles")

def seed_drivers(cursor):
    drivers = [
        ("John", "Doe", "LIC-98765", date(2026, 11, 30), "0821234567", "john.doe@example.com"),
        ("Jane", "Smith", "LIC-54321", date(2027, 3, 15), "0839876543", "jane.smith@example.com"),
        ("Bob", "Johnson", "LIC-11111", date(2026, 9, 1), "0845551234", "bob.johnson@example.com"),
        ("Alice", "Williams", "LIC-22222", date(2027, 12, 31), "0827778888", "alice.w@example.com"),
        ("Charlie", "Brown", "LIC-33333", date(2026, 10, 15), "0839990000", "charlie.b@example.com"),
    ]
    cursor.executemany("""
        INSERT IGNORE INTO drivers (first_name, last_name, licence_number, licence_expiry, phone_number, email)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, drivers)
    print(" Inserted {len(drivers)} drivers")

def seed_assignments(cursor):
    assignments = [
        (1, 1, date(2026, 1, 15), None),
        (2, 2, date(2026, 2, 1), date(2026, 5, 30)),
        (3, 3, date(2026, 6, 10), None),
        (1, 4, date(2026, 7, 1), date(2026, 7, 15)),
    ]
    cursor.executemany("""
        INSERT INTO assignments (vehicleID, driverID, assigned_date, unassigned_date)
        VALUES (%s, %s, %s, %s)
    """, assignments)
    print(" Inserted {len(assignments)} assignments")

def seed_maintenance(cursor):
    maintenance = [
        (1, date(2026, 3, 15), 2500.00, "Full service - oil change, brake pads, air filter", "Full Service"),
        (1, date(2026, 7, 20), 800.00, "Tyre replacement - all 4 tyres", "Tyre Change"),
        (2, date(2026, 4, 10), 1200.00, "Engine tune-up and diagnostic", "Tune-up"),
        (3, date(2026, 8, 1), 3500.00, "Major repair - transmission replacement", "Major Repair"),
        (2, date(2026, 9, 5), 450.00, "Wheel alignment and balancing", "Wheel Service"),
    ]
    cursor.executemany("""
        INSERT INTO maintenance_logs (vehicleID, service_date, cost, description, service_type)
        VALUES (%s, %s, %s, %s, %s)
    """, maintenance)
    print("Inserted {len(maintenance)} maintenance logs")

def seed_alerts(cursor):
    alerts = [
        (1, None, "Insurance", date(2026, 12, 31), False),
        (1, None, "Roadworthy", date(2026, 10, 15), False),
        (None, 1, "Licence", date(2026, 11, 30), False),
        (3, None, "Roadworthy", date(2026, 8, 1), True),
        (None, 3, "Licence", date(2026, 9, 1), False),
    ]
    cursor.executemany("""
        INSERT INTO expiry_alerts (vehicleID, driverID, alert_type, expiry_date, is_notified)
        VALUES (%s, %s, %s, %s, %s)
    """, alerts)
    print(" Inserted {len(alerts)} expiry alerts")

def main():
    print("=" * 50)
    print("VEHICLE FLEET DB - SAMPLE DATA INSERTION")
    print("=" * 50)
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print("\n Inserting sample data...")
        seed_vehicles(cursor)
        seed_drivers(cursor)
        seed_assignments(cursor)
        seed_maintenance(cursor)
        seed_alerts(cursor)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("\n SAMPLE DATA INSERTED SUCCESSFULLY!")
        
    except mysql.connector.Error as e:
        print("\n Database Error: {e}")
        print("\n   Make sure:")
        print("   1. XAMPP MySQL is running (green in XAMPP Control Panel)")
        print("   2. Your .env file is in the ROOT folder (not inside database/)")
        print("   3. You ran init_db.py successfully first")
        print("   4. Your .env has DB_PASSWORD= (blank for XAMPP default)")

if __name__ == "__main__":
    main()