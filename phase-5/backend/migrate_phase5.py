"""Phase 5 database migration script - adds advanced todo fields."""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def migrate():
    """Run Phase 5 migrations."""
    db_url = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()

    try:
        print("Starting Phase 5 migrations...")

        # Check if columns already exist
        cursor.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name='todos' AND column_name='priority'
        """)

        if cursor.fetchone():
            print("[OK] Phase 5 fields already exist. Skipping migration.")
            return

        # Add Phase 5 columns
        print("Adding priority, tags, due_date, is_recurring, recurrence_pattern columns...")
        cursor.execute("""
            ALTER TABLE todos
            ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium' NOT NULL,
            ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
            ADD COLUMN IF NOT EXISTS due_date DATE NULL,
            ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
            ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(20) NULL,
            ADD COLUMN IF NOT EXISTS parent_todo_id INTEGER NULL REFERENCES todos(id) ON DELETE SET NULL;
        """)

        # Add constraints
        print("Adding constraints...")
        cursor.execute("""
            ALTER TABLE todos
            ADD CONSTRAINT check_priority CHECK (priority IN ('High', 'Medium', 'Low')),
            ADD CONSTRAINT check_recurrence CHECK (
                recurrence_pattern IS NULL OR
                recurrence_pattern IN ('Daily', 'Weekly', 'Monthly')
            );
        """)

        # Create indexes
        print("Creating indexes...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);")

        conn.commit()
        print("[SUCCESS] Phase 5 migrations completed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Migration failed: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    migrate()
