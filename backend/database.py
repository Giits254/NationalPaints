from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_application_path():
    """Get the correct application path whether running bundled or in development"""
    if getattr(sys, 'frozen', False):
        # Running in a bundle (production)
        return sys._MEIPASS
    # Running in normal Python environment
    return os.path.dirname(os.path.abspath(__file__))

def get_db_path():
    """Get the database path with proper error handling"""
    try:
        # Check if DB_PATH environment variable is set (production)
        if db_path := os.environ.get('DB_PATH'):
            logger.info(f"Using database path from environment: {db_path}")
            return f"sqlite:///{db_path}"

        # Development path - relative to application root
        base_dir = get_application_path()
        db_path = os.path.join(base_dir, "inventory.db")
        logger.info(f"Using development database path: {db_path}")
        return f"sqlite:///{db_path}"
    except Exception as e:
        logger.error(f"Error determining database path: {str(e)}")
        raise

# Database URL configuration
try:
    SQLALCHEMY_DATABASE_URL = get_db_path()
    logger.info(f"Database URL configured: {SQLALCHEMY_DATABASE_URL}")
except Exception as e:
    logger.error(f"Failed to configure database URL: {str(e)}")
    raise

# Create engine with proper error handling
try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={
            "check_same_thread": False,
            "timeout": 30  # Add timeout for better error handling
        }
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {str(e)}")
    raise

# Session configuration
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    stock = Column(Integer)
    paint_class = Column(String)

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String)
    quantity = Column(Integer)
    buyer_name = Column(String, nullable=True, default='Unknown')
    timestamp = Column(DateTime, default=datetime.utcnow)
    previous_stock = Column(Integer)
    new_stock = Column(Integer)

class PaintClass(Base):
    __tablename__ = "paint_classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

def get_db():
    """Database session generator with proper error handling"""
    db = SessionLocal()
    try:
        logger.debug("Database session created")
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        raise
    finally:
        logger.debug("Closing database session")
        db.close()