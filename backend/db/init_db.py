# backend/db/init_db.py
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine, Base
from app.models import driver, vehicle, assignment, maintenance


def create_tables():
    print("=" * 55)
    print("VFMS - PostgreSQL Database Setup")
    print("=" * 55)
    print("\nCreating tables from SQLAlchemy models...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
        print("\nTables in schema:")
        for table_name in sorted(Base.metadata.tables.keys()):
            print(f"   - {table_name}")
    except Exception as e:
        print(f"\nError: {e}")
        raise


if __name__ == "__main__":
    create_tables()