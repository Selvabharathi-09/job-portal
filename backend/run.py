import os
from app import create_app
from app.extensions import db
from seed.seed_db import seed_database

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Ensure database tables exist and single admin is seeded
        db.create_all()
        seed_database()

    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Job Portal Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
