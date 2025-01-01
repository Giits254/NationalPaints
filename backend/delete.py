from database import SessionLocal, Sale, logging
import sys

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def clear_sales_history():
    """
    Clear all records from the sales history table
    Returns the number of records deleted
    """
    db = SessionLocal()
    try:
        # Get the count of records before deletion
        count = db.query(Sale).count()
        logger.info(f"Found {count} sales records to delete")

        # Delete all records from the sales table
        db.query(Sale).delete()

        # Commit the transaction
        db.commit()
        logger.info(f"Successfully deleted {count} sales records")
        return count

    except Exception as e:
        db.rollback()
        logger.error(f"Error clearing sales history: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    try:
        # Add a confirmation prompt
        response = input("Are you sure you want to clear all sales history? This action cannot be undone. (yes/no): ")

        if response.lower() == 'yes':
            deleted_count = clear_sales_history()
            print(f"Successfully cleared {deleted_count} sales records")
        else:
            print("Operation cancelled")
            sys.exit(0)

    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)