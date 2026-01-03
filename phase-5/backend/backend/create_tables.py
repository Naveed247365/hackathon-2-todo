"""Create database tables."""
from sqlalchemy import text
from database import engine
from models import Base

print("Creating database tables...")

try:
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created successfully")

    # Verify tables
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema='public'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result]

        print(f"\nTables in database: {tables}")

        if 'users' in tables and 'todos' in tables:
            print("\n[SUCCESS] Both users and todos tables exist!")

            # Show users table structure
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name='users'
                ORDER BY ordinal_position
            """))
            print("\nusers table columns:")
            for row in result:
                print(f"  - {row[0]}: {row[1]}")

            # Show todos table structure
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name='todos'
                ORDER BY ordinal_position
            """))
            print("\ntodos table columns:")
            for row in result:
                print(f"  - {row[0]}: {row[1]}")
        else:
            print("[FAIL] Tables not created properly")

except Exception as e:
    print(f"[FAIL] Error: {e}")
    import traceback
    traceback.print_exc()
