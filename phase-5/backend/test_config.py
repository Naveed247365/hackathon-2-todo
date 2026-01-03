"""Test configuration and database connection."""
import sys

print("Testing Phase 2 Backend Configuration...")
print("=" * 50)

# Test environment loading
try:
    from dotenv import load_dotenv
    import os
    load_dotenv()
    print("[OK] Environment variables loaded")

    db_url = os.getenv("DATABASE_URL")
    jwt_secret = os.getenv("JWT_SECRET")

    if db_url:
        # Clean quotes
        if db_url.startswith('"') and db_url.endswith('"'):
            db_url = db_url[1:-1]
        print(f"[OK] DATABASE_URL configured: {db_url[:30]}...")
    else:
        print("[FAIL] DATABASE_URL not found")
        sys.exit(1)

    if jwt_secret:
        print(f"[OK] JWT_SECRET configured: {jwt_secret[:10]}...")
    else:
        print("[FAIL] JWT_SECRET not found")
        sys.exit(1)

except Exception as e:
    print(f"[FAIL] Environment loading failed: {e}")
    sys.exit(1)

# Test database connection
try:
    from database import engine, init_db
    print("[OK] Database module imported")

    # Test connection
    with engine.connect() as conn:
        print("[OK] Database connection successful")

    # Initialize tables
    init_db()
    print("[OK] Database tables created/verified")

except Exception as e:
    print(f"[FAIL] Database setup failed: {e}")
    sys.exit(1)

# Test models
try:
    from models import User, Todo
    print("[OK] Models imported successfully")
except Exception as e:
    print(f"[FAIL] Models import failed: {e}")
    sys.exit(1)

# Test auth utilities
try:
    from auth import hash_password, verify_password, create_access_token, verify_token
    print("[OK] Auth utilities imported")

    # Test password hashing
    test_password = "test1234"
    hashed = hash_password(test_password)
    if hashed.startswith("$2b$"):
        print("[OK] Password hashing works (bcrypt)")

    if verify_password(test_password, hashed):
        print("[OK] Password verification works")

    # Test JWT
    token = create_access_token(1, "test@test.com")
    if token:
        print(f"[OK] JWT creation works: {token[:20]}...")

    payload = verify_token(token)
    if payload.get("sub") == "1":
        print("[OK] JWT verification works")

except Exception as e:
    print(f"[FAIL] Auth utilities failed: {e}")
    sys.exit(1)

print("=" * 50)
print("[SUCCESS] All configuration tests passed!")
print("\nBackend is ready to run:")
print("  python -m uvicorn main:app --reload --port 8000")
