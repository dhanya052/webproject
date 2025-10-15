import uuid
import re
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from extensions import db
from models import User

user_bp = Blueprint("user_bp", __name__, url_prefix="/api/users")

# Email validation regex
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

### ✅ User Login API
@user_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    if not all(k in data for k in ("email", "password")):
        return jsonify({"error": "Missing email or password"}), 400

    if not re.match(EMAIL_REGEX, data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user.id,  # UUID is stored as string, no conversion needed
        "role": user.role,
        "name": user.name
    }), 200

### ✅ User Registration API
@user_bp.route("/", methods=["POST"])
def register_user():
    data = request.json

    # Validate input fields
    if not all(k in data for k in ("name", "email", "password", "role")):
        return jsonify({"error": "Missing required fields"}), 400

    if data["role"] not in ["user", "admin"]:
        return jsonify({"error": "Invalid role"}), 400

    if not re.match(EMAIL_REGEX, data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    hashed_password = generate_password_hash(data["password"], method="pbkdf2:sha256", salt_length=16)

    new_user = User(id=str(uuid.uuid4()), name=data["name"], email=data["email"], password=hashed_password, role=data["role"])

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            "message": f"{data['role'].capitalize()} user registered successfully",
            "user_id": new_user.id,  # UUID stored as string, no need for conversion,  # UUID is stored as string, no conversion needed
        "role": new_user.role,
        "name": new_user.name
    }), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already registered"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

### ✅ Get User by ID API
@user_bp.route("/<string:user_id>", methods=["GET"])
def get_user(user_id):
    try:
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
             "role":user.role
        }), 200
    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400

### ✅ Get All Users API
@user_bp.route("/", methods=["GET"])
def get_all_users():
    users = User.query.all()
    if not users:
        return jsonify({"message": "No users found"}), 404

    users_list = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role":user.role
        }
        for user in users
    ]
    return jsonify(users_list), 200

### ✅ Forgot Password API
@user_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json

    if "email" not in data:
        return jsonify({"error": "Email is required"}), 400

    if not re.match(EMAIL_REGEX, data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"error": "Email not found"}), 404

    # For real-world use, an email would be sent here for password reset instructions
    return jsonify({"message": "Password reset email sent. Please check your inbox."}), 200

### ✅ Reset Password API
@user_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json

    if "email" not in data or "new_password" not in data:
        return jsonify({"error": "Email and new password are required"}), 400

    if not re.match(EMAIL_REGEX, data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"error": "Email not found"}), 404

    # Update the user's password with the provided new password
    new_password = data["new_password"]
    user.password = generate_password_hash(new_password, method="pbkdf2:sha256", salt_length=16)

    try:
        db.session.commit()
        return jsonify({"message": "Password reset successful. You can now log in with your new password."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@user_bp.route("/<string:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        # Find the user by ID
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Delete the user
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": f"User {user_id} deleted successfully"}), 200

    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500    
