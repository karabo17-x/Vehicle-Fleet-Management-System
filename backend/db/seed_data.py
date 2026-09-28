# backend/db/seed_data.py
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.models.driver import Driver, DriverStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.assignment import Assignment
from app.models.maintenance import MaintenanceRecord


def seed_data():
    print("=" * 55)
    print("VFMS - Sample Data Insertion")
    print("=" * 55)
    session = SessionLocal()
    try:
        drivers = [
            Driver(first_name="John", last_name="Doe", phone="0821234567",
                   email="john.doe@example.com", status=DriverStatus.ACTIVE),
            Driver(first_name="Jane", last_name="Smith", phone="0839876543",
                   email="jane.smith@example.com", status=DriverStatus.ACTIVE),
            Driver(first_name="Bob", last_name="Johnson", phone="0845551234",
                   email="bob.j@example.com", status=DriverStatus.SUSPENDED),
        ]
        session.add_all(drivers)
        session.commit()
        print(f"Inserted {len(drivers)} drivers")
        print("Done!")
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_data()