from flask import Blueprint, request, jsonify
from app import db, bcrypt
from app.models import User, Customer

customer_bp = Blueprint("customer_bp", __name__)


# 1. Register a new customer
@customer_bp.route("/api/customers/register", methods=["POST"])
def register_customer():
    data = request.get_json()

    # Basic validation
    required_fields = ["name", "email", "password"]
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


# 2. View all customers
@customer_bp.route("/api/customers", methods=["GET"])
def get_customers():
    customers = Customer.query.all()

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

    return jsonify(result), 200


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