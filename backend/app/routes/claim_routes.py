from flask import Blueprint, request, jsonify
from app import db
from app.models import Claim, Policy
from app.utils import role_required
from app.utils import notify
from app.models import Customer

claim_bp = Blueprint("claim_bp", __name__)


# 1. Submit a new claim
@claim_bp.route("/api/claims", methods=["POST"])
def submit_claim():
    data = request.get_json()

    required_fields = ["policy_id", "claim_amount", "reason"]
    # Extra validation: claim_amount must be positive
    try:
        claim_amount = float(data["claim_amount"])
        if claim_amount <= 0:
            return jsonify({"error": "claim_amount must be greater than 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "claim_amount must be a valid number"}), 400

    # Extra validation: reason must be meaningful, not just spaces
    if not data["reason"].strip():
        return jsonify({"error": "reason cannot be empty or just spaces"}), 400

    for field in required_fields:
        if field not in data or data[field] in [None, ""]:
            return jsonify({"error": f"{field} is required"}), 400

    policy = Policy.query.get(data["policy_id"])
    if not policy:
        return jsonify({"error": "Policy not found"}), 404

    # Only allow claims on active policies
    if policy.status != "active":
        return jsonify({"error": "Claims can only be submitted for active policies"}), 400

    new_claim = Claim(
        policy_id=data["policy_id"],
        claim_amount=data["claim_amount"],
        reason=data["reason"],
        status="pending"
    )
    db.session.add(new_claim)
    db.session.commit()

    return jsonify({
        "message": "Claim submitted successfully",
        "claim_id": new_claim.id
    }), 201


# 2. View all claims (with status filter + pagination)
@claim_bp.route("/api/claims", methods=["GET"])
def get_claims():
    status = request.args.get("status", "", type=str)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    query = Claim.query

    if status:
        query = query.filter(Claim.status == status)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    claims = pagination.items

    result = []
    for c in claims:
        result.append({
            "id": c.id,
            "policy_id": c.policy_id,
            "policy_number": c.policy.policy_number,
            "claim_amount": float(c.claim_amount),
            "reason": c.reason,
            "status": c.status,
            "submission_date": str(c.submission_date)
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

# 3. View claims for a specific policy
@claim_bp.route("/api/policies/<int:policy_id>/claims", methods=["GET"])
def get_claims_by_policy(policy_id):
    policy = Policy.query.get(policy_id)
    if not policy:
        return jsonify({"error": "Policy not found"}), 404

    claims = Claim.query.filter_by(policy_id=policy_id).all()

    result = []
    for c in claims:
        result.append({
            "id": c.id,
            "claim_amount": float(c.claim_amount),
            "reason": c.reason,
            "status": c.status,
            "submission_date": str(c.submission_date)
        })

    return jsonify(result), 200

# 4. Approve or reject a claim (Admin/Agent only)
@claim_bp.route("/api/claims/<int:claim_id>/review", methods=["PUT"])
@role_required("admin", "agent")
def review_claim(claim_id):
    data = request.get_json()

    if "status" not in data or data["status"] not in ["approved", "rejected"]:
        return jsonify({"error": "status must be 'approved' or 'rejected'"}), 400

    claim = Claim.query.get(claim_id)
    if not claim:
        return jsonify({"error": "Claim not found"}), 404

    if claim.status != "pending":
        return jsonify({"error": f"Claim already {claim.status}, cannot review again"}), 400

    claim.status = data["status"]
    db.session.commit()
    policy_obj = Policy.query.get(claim.policy_id)
    customer_obj = Customer.query.get(policy_obj.customer_id) if policy_obj else None
    if customer_obj:
        notify(customer_obj.user_id, f"Your claim on policy {policy_obj.policy_number} was {data['status']}.", "claim_reviewed")
    return jsonify({"message": f"Claim {data['status']} successfully"}), 200
