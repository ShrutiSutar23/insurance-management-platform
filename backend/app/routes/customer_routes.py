from flask import Blueprint, request, jsonify
from app import db, bcrypt
from app.models import User, Customer
from flask_jwt_extended import create_access_token
from app.utils import role_required
from datetime import datetime

customer_bp = Blueprint("customer_bp", __name__)


# 1. Register a new customer
@customer_bp.route("/api/customers/register", methods=["POST"])
def register_customer():
    data = request.get_json()

    # Basic validation
    required_fields = ["name", "email", "password"]
    # Extra validation: basic email format check
    if "@" not in data["email"] or "." not in data["email"]:
        return jsonify({"error": "Invalid email format"}), 400

    # Extra validation: password minimum length
    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field} is required"}), 400

    # Check if email already exists
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    # Hash the password before saving (never store plain text passwords!)
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    # Create the User record (login credentials)
    new_user = User(
        name=data["name"],
        email=data["email"],
        password=hashed_password,
        role="customer"
    )
    db.session.add(new_user)
    db.session.commit()  # commit here so new_user.id gets generated

    # Create the linked Customer record (profile details)
    new_customer = Customer(
        user_id=new_user.id,
        name=data["name"],
        email=data["email"],
        phone=data.get("phone"),
        address=data.get("address"),
        dob=data.get("dob")
    )
    db.session.add(new_customer)
    db.session.commit()

    return jsonify({
        "message": "Customer registered successfully",
        "customer_id": new_customer.id
    }), 201

# Edit customer information
@customer_bp.route("/api/customers/<int:customer_id>", methods=["PUT"])
def update_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    data = request.get_json()

    # Only update fields that were actually provided
    if "name" in data and data["name"].strip():
        customer.name = data["name"]
    if "phone" in data:
        customer.phone = data["phone"]
    if "address" in data:
        customer.address = data["address"]
    if "dob" in data:
        try:
            customer.dob = datetime.strptime(data["dob"], "%Y-%m-%d").date() if data["dob"] else None
        except ValueError:
            return jsonify({"error": "dob must be in YYYY-MM-DD format"}), 400

    db.session.commit()

    return jsonify({"message": "Customer updated successfully"}), 200


# 2. View all customers (with search + pagination)
@customer_bp.route("/api/customers", methods=["GET"])
def get_customers():
    search = request.args.get("search", "", type=str)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    query = Customer.query

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            db.or_(
                Customer.name.ilike(search_pattern),
                Customer.email.ilike(search_pattern)
            )
        )

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    customers = pagination.items

    result = []
    for c in customers:
        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "address": c.address,
            "dob": str(c.dob) if c.dob else None
        })

    return jsonify({
        "data": result,
        "pagination": {
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "current_page": pagination.page,
            "per_page": pagination.per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), 200


# 3. View a single customer by ID
@customer_bp.route("/api/customers/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    customer = Customer.query.get(customer_id)

    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    return jsonify({
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address,
        "dob": str(customer.dob) if customer.dob else None
    }), 200


# 4. Login (for any role - admin, agent, customer)
@customer_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    if "email" not in data or "password" not in data:
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not bcrypt.check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "name": user.name}
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200

from app.utils import role_required

# 5. Admin creates a new user (admin, agent, or customer) - Admin only
@customer_bp.route("/api/admin/create-user", methods=["POST"])
@role_required("admin")
def admin_create_user():
    data = request.get_json()

    required_fields = ["name", "email", "password", "role"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field} is required"}), 400

    if data["role"] not in ["admin", "agent", "customer"]:
        return jsonify({"error": "role must be 'admin', 'agent', or 'customer'"}), 400

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    new_user = User(
        name=data["name"],
        email=data["email"],
        password=hashed_password,
        role=data["role"]
    )
    db.session.add(new_user)
    db.session.commit()

    # If the new user is a customer, also create their Customer profile record
    if data["role"] == "customer":
        new_customer = Customer(
            user_id=new_user.id,
            name=data["name"],
            email=data["email"],
            phone=data.get("phone"),
            address=data.get("address")
        )
        db.session.add(new_customer)
        db.session.commit()

    return jsonify({
        "message": f"{data['role'].capitalize()} account created successfully",
        "user_id": new_user.id
    }), 201