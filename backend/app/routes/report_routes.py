from flask import Blueprint, jsonify
from app import db
from app.models import Customer, Policy, Claim, PremiumPayment
from sqlalchemy import func, extract
from datetime import datetime

report_bp = Blueprint("report_bp", __name__)


@report_bp.route("/api/reports/dashboard", methods=["GET"])
def dashboard_summary():

    # 1. Policy counts by status
    total_policies = Policy.query.count()
    active_policies = Policy.query.filter_by(status="active").count()
    expired_policies = Policy.query.filter_by(status="expired").count()
    cancelled_policies = Policy.query.filter_by(status="cancelled").count()

    # 2. Claim statistics
    total_claims = Claim.query.count()
    pending_claims = Claim.query.filter_by(status="pending").count()
    approved_claims = Claim.query.filter_by(status="approved").count()
    rejected_claims = Claim.query.filter_by(status="rejected").count()

    # 3. Premium collection (sum of all "paid" payments)
    total_collected = db.session.query(func.sum(PremiumPayment.amount)).filter(
        PremiumPayment.payment_status == "paid"
    ).scalar() or 0

    total_pending_amount = db.session.query(func.sum(PremiumPayment.amount)).filter(
        PremiumPayment.payment_status.in_(["pending", "overdue"])
    ).scalar() or 0

    # 4. Customer growth (total customers, could expand later to monthly breakdown)
    total_customers = Customer.query.count()

    # 5. Monthly policy creation (for a simple chart: how many policies created per month)
    monthly_policies = db.session.query(
        extract("month", Policy.created_at).label("month"),
        extract("year", Policy.created_at).label("year"),
        func.count(Policy.id).label("count")
    ).group_by("year", "month").order_by("year", "month").all()

    monthly_data = [
        {"month": int(m.month), "year": int(m.year), "count": m.count}
        for m in monthly_policies
    ]

    return jsonify({
        "policies": {
            "total": total_policies,
            "active": active_policies,
            "expired": expired_policies,
            "cancelled": cancelled_policies
        },
        "claims": {
            "total": total_claims,
            "pending": pending_claims,
            "approved": approved_claims,
            "rejected": rejected_claims
        },
        "premium_collection": {
            "total_collected": float(total_collected),
            "total_pending": float(total_pending_amount)
        },
        "customers": {
            "total": total_customers
        },
        "monthly_policy_creation": monthly_data
    }), 200