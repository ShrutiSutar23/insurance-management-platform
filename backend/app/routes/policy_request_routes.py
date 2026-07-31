from flask import Blueprint, request, jsonify
from app import db
from app.models import PolicyRequest, Policy, Customer
from app.utils import role_required
from app.routes.my_routes import get_current_customer
from app.utils import notify_all_staff, notify

request_bp = Blueprint("request_bp", __name__)


# Customer: request a NEW policy
@request_bp.route("/api/my/policy-requests", methods=["POST"])
@role_required("customer")
def create_policy_request():
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    data = request.get_json()
    if "policy_type" not in data or not data["policy_type"]:
        return jsonify({"error": "policy_type is required"}), 400

    new_request = PolicyRequest(
        customer_id=customer.id,
        request_type="new",
        policy_type=data["policy_type"],
        desired_coverage=data.get("desired_coverage"),
        notes=data.get("notes"),
        status="pending"
    )
    db.session.add(new_request)
    db.session.commit()
    notify_all_staff(f"{customer.name} requested a new {data['policy_type']} policy", "policy_request")
    return jsonify({"message": "Policy request submitted", "request_id": new_request.id}), 201


# Customer: request RENEWAL of an existing policy
@request_bp.route("/api/my/policies/<int:policy_id>/renewal-request", methods=["POST"])
@role_required("customer")
def create_renewal_request(policy_id):
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    policy = Policy.query.get(policy_id)
    if not policy or policy.customer_id != customer.id:
        return jsonify({"error": "Policy not found"}), 404

    if policy.status == "cancelled":
        return jsonify({"error": "Cancelled policies cannot be renewed"}), 400

    existing = PolicyRequest.query.filter_by(policy_id=policy_id, request_type="renewal", status="pending").first()
    if existing:
        return jsonify({"error": "A renewal request is already pending for this policy"}), 409

    data = request.get_json() or {}
    new_request = PolicyRequest(
        customer_id=customer.id,
        request_type="renewal",
        policy_id=policy_id,
        notes=data.get("notes"),
        status="pending"
    )
    db.session.add(new_request)
    db.session.commit()
    notify_all_staff(f"{customer.name} requested renewal for policy {policy.policy_number}", "policy_request")
    return jsonify({"message": "Renewal request submitted", "request_id": new_request.id}), 201


# Customer: view their own requests
@request_bp.route("/api/my/policy-requests", methods=["GET"])
@role_required("customer")
def my_policy_requests():
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    requests_ = PolicyRequest.query.filter_by(customer_id=customer.id).all()
    result = [{
        "id": r.id, "request_type": r.request_type, "policy_type": r.policy_type,
        "desired_coverage": float(r.desired_coverage) if r.desired_coverage else None,
        "policy_id": r.policy_id, "notes": r.notes, "status": r.status,
        "created_at": str(r.created_at)
    } for r in requests_]
    return jsonify(result), 200


# Agent/Admin: view all pending requests
@request_bp.route("/api/policy-requests", methods=["GET"])
@role_required("admin", "agent")
def get_policy_requests():
    status = request.args.get("status", "pending")
    query = PolicyRequest.query
    if status:
        query = query.filter_by(status=status)
    requests_ = query.all()

    result = []
    for r in requests_:
        result.append({
            "id": r.id, "request_type": r.request_type,
            "customer_name": r.customer.name, "customer_id": r.customer_id,
            "policy_type": r.policy_type,
            "desired_coverage": float(r.desired_coverage) if r.desired_coverage else None,
            "policy_id": r.policy_id,
            "existing_policy_number": r.policy.policy_number if r.policy else None,
            "notes": r.notes, "status": r.status, "created_at": str(r.created_at)
        })
    return jsonify(result), 200


# Agent/Admin: reject a request (with reason)
@request_bp.route("/api/policy-requests/<int:request_id>/reject", methods=["PUT"])
@role_required("admin", "agent")
def reject_policy_request(request_id):
    req = PolicyRequest.query.get(request_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404
    if req.status != "pending":
        return jsonify({"error": f"Request already {req.status}"}), 400

    req.status = "rejected"
    db.session.commit()
    return jsonify({"message": "Request rejected"}), 200