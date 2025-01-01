from database import Base, engine, SessionLocal
from database import User, PaintClass
from werkzeug.security import generate_password_hash


def initialize_database():
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)

        db = SessionLocal()

        # Create default paint classes
        default_classes = ['Solid Colors', 'Metallic', 'Pearl', 'Matte']
        for class_name in default_classes:
            existing_class = db.query(PaintClass).filter_by(name=class_name).first()
            if not existing_class:
                paint_class = PaintClass(name=class_name)
                db.add(paint_class)

        # Create default admin user
        admin_user = db.query(User).filter_by(username='admin').first()
        if not admin_user:
            admin_user = User(
                username='admin',
                password=generate_password_hash('admin123'),
                role='admin'
            )
            db.add(admin_user)

        db.commit()
        print("Database initialized successfully")
        print("Default admin credentials:")
        print("Username: admin")
        print("Password: admin123")
        return True

    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        return False


if __name__ == "__main__":
    initialize_database()