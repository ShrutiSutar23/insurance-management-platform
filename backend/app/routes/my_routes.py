from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models import Customer, Policy, Claim, PremiumPayment, Document
from app.utils import role_required
from datetime import datetime
from app.utils import notify, notify_all_staff

my_bp = Blueprint("my_bp", __name__)


def get_current_customer():
    """Find the Customer profile linked to the logged-in user's token."""
    user_id = get_jwt_identity()
    return Customer.query.filter_by(user_id=int(user_id)).first()


@my_bp.route("/api/my/profile", methods=["GET"])
@role_required("customer")
def my_profile():
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404
    return jsonify({
        "id": customer.id, "name": customer.name, "email": customer.email,
        "phone": customer.phone, "address": customer.address,
        "dob": str(customer.dob) if customer.dob else None
    }), 200


@my_bp.route("/api/my/policies", methods=["GET"])
@role_required("customer")
def my_policies():
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    policies = Policy.query.filter_by(customer_id=customer.id).all()
    result = [{
        "id": p.id, "policy_number": p.policy_number, "policy_type": p.policy_type,
        "premium_amount": float(p.premium_amount), "start_date": str(p.start_date),
        "end_date": str(p.end_date), "status": p.status
    } for p in policies]
    return jsonify(result), 200


@my_bp.route("/api/my/claims", methods=["GET"])
@role_required("customer")
def my_claims():
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    policy_ids = [p.id for p in Policy.query.filter_by(customer_id=customer.id).all()]
    claims = Claim.query.filter(Claim.policy_id.in_(policy_ids)).all()
    result = [{
        "id": c.id, "policy_id": c.policy_id, "claim_amount": float(c.claim_amount),
        "reason": c.reason, "status": c.status, "submission_date": str(c.submission_date)
    } for c in claims]
    return jsonify(result), 200


@my_bp.route("/api/my/claims", methods=["POST"])
@role_required("customer")
def my_submit_claim():
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    data = request.get_json()
    for field in ["policy_id", "claim_amount", "reason"]:
        if field not in data or data[field] in [None, ""]:
            return jsonify({"error": f"{field} is required"}), 400

    policy = Policy.query.get(data["policy_id"])
    if not policy or policy.customer_id != customer.id:
        return jsonify({"error": "Policy not found"}), 404
    if policy.status != "active":
        return jsonify({"error": "Claims can only be submitted for active policies"}), 400

    try:
        claim_amount = float(data["claim_amount"])
        if claim_amount <= 0:
            return jsonify({"error": "claim_amount must be greater than 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "claim_amount must be a valid number"}), 400

    new_claim = Claim(policy_id=policy.id, claim_amount=claim_amount, reason=data["reason"], status="pending")
    db.session.add(new_claim)
    db.session.commit()
    notify_all_staff(f"{customer.name} submitted a claim of ₹{claim_amount} for policy {policy.policy_number}", "claim_submitted")

    return jsonify({"message": "Claim submitted successfully", "claim_id": new_claim.id}), 201


@my_bp.route("/api/my/payments", methods=["GET"])
@role_required("customer")
def my_payments():
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    policy_ids = [p.id for p in Policy.query.filter_by(customer_id=customer.id).all()]
    payments = PremiumPayment.query.filter(PremiumPayment.policy_id.in_(policy_ids)).all()
    result = [{
        "id": p.id, "policy_id": p.policy_id, "amount": float(p.amount),
        "due_date": str(p.due_date), "payment_date": str(p.payment_date) if p.payment_date else None,
        "payment_status": p.payment_status
    } for p in payments]
    return jsonify(result), 200


@my_bp.route("/api/my/payments/<int:payment_id>/pay", methods=["PUT"])
@role_required("customer")
def my_pay_premium(payment_id):
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    payment = PremiumPayment.query.get(payment_id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    policy = Policy.query.get(payment.policy_id)
    if not policy or policy.customer_id != customer.id:
        return jsonify({"error": "Payment not found"}), 404

    if payment.payment_status == "paid":
        return jsonify({"error": "This payment is already paid"}), 400

    payment.payment_status = "paid"
    payment.payment_date = datetime.utcnow().date()
    db.session.commit()

    notify(int(get_jwt_identity()), f"Payment of ₹{payment.amount} confirmed for policy {policy.policy_number}. Receipt: PMT-{payment.id}.", "payment_confirmed")
    return jsonify({"message": "Payment successful (simulated)"}), 200


@my_bp.route("/api/my/documents", methods=["GET"])
@role_required("customer")
def my_documents():
    customer = get_current_customer()
    if not customer:
        return jsonify({"error": "Customer profile not found"}), 404

    documents = Document.query.filter_by(customer_id=customer.id).all()
    result = [{
        "id": d.id, "file_name": d.file_name, "document_type": d.document_type,
        "uploaded_at": str(d.uploaded_at)
    } for d in documents]
    return jsonify(result), 200