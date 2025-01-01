# migrations.py
from sqlalchemy import create_engine, text
from database import SQLALCHEMY_DATABASE_URL, Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_migrations():
    """Run database migrations to handle schema changes"""
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

    try:
        # Check if buyer_name column exists
        with engine.connect() as connection:
            # Get column info from sales table
            result = connection.execute(text("""
                SELECT name FROM pragma_table_info('sales')
                WHERE name='buyer_name'
            """))
            buyer_name_exists = result.fetchone() is not None

            if not buyer_name_exists:
                logger.info("Adding buyer_name column to sales table...")
                # Add buyer_name column with default value
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


def check_and_update_schema():
    """Function to check and update database schema"""
    try:
        # Create all tables (will not affect existing tables)
        Base.metadata.create_all(bind=create_engine(SQLALCHEMY_DATABASE_URL))
        # Run migrations for existing tables
        run_migrations()
        return True
    except Exception as e:
        logger.error(f"Schema update failed: {str(e)}")
        return False


if __name__ == "__main__":
    check_and_update_schema()