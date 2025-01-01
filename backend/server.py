import os
import sys

# Debug prints to understand our environment
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Current directory: {current_dir}")
print(f"Files in current directory: {os.listdir(current_dir)}")
print(f"Python path: {sys.path}")

# Add the current directory to Python path
sys.path.insert(0, current_dir)
from flask_cors import CORS
from flask import Flask, request
from database import get_db, engine, Base, User
from auth import init_auth_routes
from paintstore import init_routes
from werkzeug.security import generate_password_hash
from sqlalchemy import text
import logging
from logging.handlers import RotatingFileHandler


# Set up logging
def setup_logging():
    if getattr(sys, 'frozen', False):
        # If running as bundled exe, log to user's app data directory
        log_dir = os.path.join(os.getenv('APPDATA'), 'PaintStore')
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        log_file = os.path.join(log_dir, 'backend.log')
    else:
        # If running in development, log to current directory
        log_file = 'backend.log'

    handler = RotatingFileHandler(log_file, maxBytes=1024 * 1024, backupCount=5)
    handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))

    logger = logging.getLogger()
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger


logger = setup_logging()

# Determine application root path
if getattr(sys, 'frozen', False):
    # Running in a bundle (production)
    application_path = os.path.dirname(sys.executable)
    logger.info(f"Running in bundled mode from: {application_path}")
else:
    # Running in normal Python environment
    application_path = os.path.dirname(os.path.abspath(__file__))
    logger.info(f"Running in development mode from: {application_path}")

# Configure relative paths
DATABASE_PATH = os.path.join(application_path, 'inventory.db')
os.environ['DB_PATH'] = DATABASE_PATH
logger.info(f"Database path: {DATABASE_PATH}")


def run_migrations(engine):
    """Run database migrations to handle schema changes"""
    try:
        with engine.connect() as connection:
            # Check if buyer_name column exists
            result = connection.execute(text("""
                SELECT name FROM pragma_table_info('sales')
                WHERE name='buyer_name'
            """))
            buyer_name_exists = result.fetchone() is not None

            if not buyer_name_exists:
                logger.info("Adding buyer_name column to sales table...")
                connection.execute(text("""
                    ALTER TABLE sales 
                    ADD COLUMN buyer_name VARCHAR DEFAULT 'Unknown'
                """))
                connection.commit()
                logger.info("Successfully added buyer_name column")
            else:
                logger.info("buyer_name column already exists")
    except Exception as e:
        logger.error(f"Error during migration: {str(e)}")
        raise


app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "file://*", "app://-", "app://.", "app://"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "allow_credentials": True
    }
})

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin', '')
    allowed_origins = ['http://localhost:3000', 'file://', 'app://-', 'app://.', 'app://']
    if any(origin.startswith(allowed) for allowed in allowed_origins):
        response.headers.add('Access-Control-Allow-Origin', origin)
        # Add these security headers
        response.headers.add('Cross-Origin-Resource-Policy', 'cross-origin')
        response.headers.add('Cross-Origin-Embedder-Policy', 'require-corp')
        response.headers.add('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


# Add health check endpoint
@app.route('/health')
def health_check():
    logger.info("Health check endpoint called")
    return {'status': 'healthy'}, 200


def initialize_database():
    try:
        logger.info(f"Initializing database at: {DATABASE_PATH}")
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")

        # Run migrations
        logger.info("Running database migrations...")
        run_migrations(engine)
        logger.info("Database migrations completed successfully")

        # Initialize admin user
        db = next(get_db())
        try:
            admin_exists = db.query(User).filter(User.username == "Geets").first()
            if not admin_exists:
                admin_user = User(
                    username="Geets",
                    password=generate_password_hash("geets123"),
                    role="admin"
                )
                db.add(admin_user)
                db.commit()
                logger.info("Admin user created successfully")
            else:
                logger.info("Admin user already exists")
        except Exception as e:
            logger.error(f"Error creating admin user: {e}")
            db.rollback()
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


# Initialize database and run migrations
initialize_database()

# Get database session
db = next(get_db())

# Register routes
paintstore_routes = init_routes(db)
app.register_blueprint(paintstore_routes, url_prefix='/api')

auth_routes, token_required = init_auth_routes(get_db)
app.register_blueprint(auth_routes, url_prefix='/api/auth')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = not getattr(sys, 'frozen', False)  # Disable debug mode in production

    logger.info(f"Starting Flask server on port {port}")
    logger.info(f"Debug mode: {debug}")

    try:
        app.run(host='127.0.0.1', port=port, debug=debug)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)