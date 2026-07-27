from flask import Blueprint, request, jsonify
from app import db
from app.models import Policy, Customer
from datetime import datetime
from app.utils import role_required

policy_bp = Blueprint("policy_bp", __name__)


# 1. Create a new policy
@policy_bp.route("/api/policies", methods=["POST"])
@role_required("admin", "agent")
def create_policy():
    data = request.get_json()

    required_fields = ["customer_id", "policy_type", "policy_number", "premium_amount", "start_date", "end_date"]
    for field in required_fields:
        if field not in data or data[field] in [None, ""]:
            return jsonify({"error": f"{field} is required"}), 400

    # Extra validation: premium amount must be positive
    try:
        premium = float(data["premium_amount"])
        if premium <= 0:
            return jsonify({"error": "premium_amount must be greater than 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "premium_amount must be a valid number"}), 400
    
    # Check the customer actually exists
    customer = Customer.query.get(data["customer_id"])
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    # Check policy_number is unique
    existing_policy = Policy.query.filter_by(policy_number=data["policy_number"]).first()
    if existing_policy:
        return jsonify({"error": "Policy number already exists"}), 409

    try:
        start_date = datetime.strptime(data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(data["end_date"], "%Y-%m-%d").date()
        # Extra validation: end_date must be after start_date
        if end_date <= start_date:
            return jsonify({"error": "end_date must be after start_date"}), 400
    except ValueError:
        return jsonify({"error": "Dates must be in YYYY-MM-DD format"}), 400

    new_policy = Policy(
        customer_id=data["customer_id"],
        policy_type=data["policy_type"],
        policy_number=data["policy_number"],
        premium_amount=data["premium_amount"],
        start_date=start_date,
        end_date=end_date,
        status="active"
    )
    db.session.add(new_policy)
    db.session.commit()

    return jsonify({
        "message": "Policy created successfully",
        "policy_id": new_policy.id
    }), 201


# 2. View all policies (with status filter + pagination)
@policy_bp.route("/api/policies", methods=["GET"])
def get_policies():
    status = request.args.get("status", "", type=str)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    query = Policy.query

    if status:
        query = query.filter(Policy.status == status)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    policies = pagination.items

    result = []
    for p in policies:
        result.append({
            "id": p.id,
            "customer_id": p.customer_id,
            "customer_name": p.customer.name,
            "policy_type": p.policy_type,
            "policy_number": p.policy_number,
            "premium_amount": float(p.premium_amount),
            "start_date": str(p.start_date),
            "end_date": str(p.end_date),
            "status": p.status
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

# 3. View policies for a specific customer
@policy_bp.route("/api/customers/<int:customer_id>/policies", methods=["GET"])
def get_policies_by_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    policies = Policy.query.filter_by(customer_id=customer_id).all()

    result = []
    for p in policies:
        result.append({
            "id": p.id,
            "policy_type": p.policy_type,
            "policy_number": p.policy_number,
            "premium_amount": float(p.premium_amount),
            "start_date": str(p.start_date),
            "end_date": str(p.end_date),
            "status": p.status
        })

    return jsonify(result), 200


# 4. Cancel a policy (Admin/Agent only)
@policy_bp.route("/api/policies/<int:policy_id>/cancel", methods=["PUT"])
@role_required("admin", "agent")
def cancel_policy(policy_id):
    policy = Policy.query.get(policy_id)
    if not policy:
        return jsonify({"error": "Policy not found"}), 404

    policy.status = "cancelled"
    db.session.commit()

    return jsonify({"message": "Policy cancelled successfully"}), 200

# Renew a policy (extends end_date, only for active or expired policies)
@policy_bp.route("/api/policies/<int:policy_id>/renew", methods=["PUT"])
@role_required("admin", "agent")
def renew_policy(policy_id):
    policy = Policy.query.get(policy_id)
    if not policy:
        return jsonify({"error": "Policy not found"}), 404

    if policy.status == "cancelled":
        return jsonify({"error": "Cancelled policies cannot be renewed"}), 400

    data = request.get_json()

    if "new_end_date" not in data or not data["new_end_date"]:
        return jsonify({"error": "new_end_date is required"}), 400

    try:
        new_end_date = datetime.strptime(data["new_end_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "new_end_date must be in YYYY-MM-DD format"}), 400

    if new_end_date <= policy.end_date:
        return jsonify({"error": "new_end_date must be after the current end_date"}), 400

    policy.end_date = new_end_date
    policy.status = "active"  # reactivate if it was expired
    db.session.commit()

    return jsonify({"message": "Policy renewed successfully", "new_end_date": str(policy.end_date)}), 200