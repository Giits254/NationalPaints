from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from sqlalchemy.orm import Session
from database import User

auth_routes = Blueprint('auth', __name__)
SECRET_KEY = 'your-secret-key'

def init_auth_routes(get_db):
    @auth_routes.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        db = next(get_db())
        try:
            user = db.query(User).filter(User.username == data.get('username')).first()

            if not user or not check_password_hash(user.password, data.get('password')):
                return jsonify({'message': 'Invalid credentials'}), 401

            token = jwt.encode({
                'username': user.username,
                'role': user.role,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY)

            return jsonify({
                'token': token,
                'role': user.role
            })
        finally:
            db.close()

    @auth_routes.route('/users', methods=['POST'])
    def create_user():
        data = request.get_json()
        if data['role'] not in ['employee', 'admin']:
            return jsonify({'message': 'Invalid role'}), 400

        hashed_password = generate_password_hash(data['password'])

        db = next(get_db())
        try:
            new_user = User(
                username=data['username'],
                password=hashed_password,
                role=data['role']
            )
            db.add(new_user)
            db.commit()
            return jsonify({'message': 'User created successfully'}), 201
        except Exception as e:
            db.rollback()
            return jsonify({'message': 'Username already exists'}), 400
        finally:
            db.close()

    @auth_routes.route('/users', methods=['GET'])
    def get_users():
        db = next(get_db())
        try:
            users = db.query(User).all()
            return jsonify([{
                'id': user.id,
                'username': user.username,
                'role': user.role
            } for user in users])
        finally:
            db.close()

    @auth_routes.route('/users/<username>', methods=['DELETE'])
    def delete_user(username):
        db = next(get_db())
        try:
            user = db.query(User).filter(User.username == username).first()
            if user:
                db.delete(user)
                db.commit()
                return jsonify({'message': 'User deleted successfully'})
            return jsonify({'message': 'User not found'}), 404
        except Exception as e:
            db.rollback()
            return jsonify({'message': 'Error deleting user'}), 500
        finally:
            db.close()

    # Since we're removing authorization, we'll return None for token_required
    return auth_routes, None