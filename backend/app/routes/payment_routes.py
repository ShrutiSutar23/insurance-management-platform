from flask import Blueprint, request, jsonify
from app import db
from app.models import PremiumPayment, Policy
from datetime import datetime, date

payment_bp = Blueprint("payment_bp", __name__)


# 1. Create a due payment record (usually done by admin/agent when setting up a policy's payment schedule)
@payment_bp.route("/api/payments", methods=["POST"])
def create_payment():
    data = request.get_json()

    required_fields = ["policy_id", "amount", "due_date"]
    for field in required_fields:
        if field not in data or data[field] in [None, ""]:
            return jsonify({"error": f"{field} is required"}), 400

    policy = Policy.query.get(data["policy_id"])
    if not policy:
        return jsonify({"error": "Policy not found"}), 404

    try:
        due_date = datetime.strptime(data["due_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "due_date must be in YYYY-MM-DD format"}), 400

    new_payment = PremiumPayment(
        policy_id=data["policy_id"],
        amount=data["amount"],
        due_date=due_date,
        payment_status="pending"
    )
    db.session.add(new_payment)
    db.session.commit()

    return jsonify({
        "message": "Payment record created",
        "payment_id": new_payment.id
    }), 201


# 2. Mark a payment as paid
@payment_bp.route("/api/payments/<int:payment_id>/pay", methods=["PUT"])
def mark_payment_paid(payment_id):
    payment = PremiumPayment.query.get(payment_id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    payment.payment_status = "paid"
    payment.payment_date = date.today()
    db.session.commit()

    return jsonify({"message": "Payment marked as paid"}), 200


# 3. View payment history for a policy
@payment_bp.route("/api/policies/<int:policy_id>/payments", methods=["GET"])
def get_payments_by_policy(policy_id):
    policy = Policy.query.get(policy_id)
    if not policy:
        return jsonify({"error": "Policy not found"}), 404

    payments = PremiumPayment.query.filter_by(policy_id=policy_id).all()

    result = []
    for p in payments:
        result.append({
            "id": p.id,
            "amount": float(p.amount),
            "due_date": str(p.due_date),
            "payment_date": str(p.payment_date) if p.payment_date else None,
            "payment_status": p.payment_status
        })

    return jsonify(result), 200


# 4. View all overdue payments (due date passed but still pending)
@payment_bp.route("/api/payments/overdue", methods=["GET"])
def get_overdue_payments():
    today = date.today()

    # Auto-update any pending payments whose due date has passed to "overdue"
    overdue_candidates = PremiumPayment.query.filter(
        PremiumPayment.due_date < today,
        PremiumPayment.payment_status == "pending"
    ).all()

    for p in overdue_candidates:
        p.payment_status = "overdue"
    db.session.commit()

    overdue_payments = PremiumPayment.query.filter_by(payment_status="overdue").all()

    result = []
    for p in overdue_payments:
        result.append({
            "id": p.id,
            "policy_id": p.policy_id,
            "amount": float(p.amount),
            "due_date": str(p.due_date),
            "payment_status": p.payment_status
        })

    return jsonify(result), 200