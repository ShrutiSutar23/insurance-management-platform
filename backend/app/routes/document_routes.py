import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models import Document, Customer

document_bp = Blueprint("document_bp", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# 1. Upload a document for a customer
@document_bp.route("/api/customers/<int:customer_id>/documents", methods=["POST"])
def upload_document(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Use pdf, png, jpg, or jpeg"}), 400

    # Make filename safe and unique (prefix with customer_id to avoid name clashes)
    safe_filename = secure_filename(file.filename)
    unique_filename = f"{customer_id}_{safe_filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    file.save(file_path)

    document_type = request.form.get("document_type", "general")

    new_document = Document(
        customer_id=customer_id,
        file_name=safe_filename,
        file_path=file_path,
        document_type=document_type
    )
    db.session.add(new_document)
    db.session.commit()

    return jsonify({
        "message": "Document uploaded successfully",
        "document_id": new_document.id
    }), 201


# 2. View all documents for a customer
@document_bp.route("/api/customers/<int:customer_id>/documents", methods=["GET"])
def get_documents(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    documents = Document.query.filter_by(customer_id=customer_id).all()

    result = []
    for d in documents:
        result.append({
            "id": d.id,
            "file_name": d.file_name,
            "document_type": d.document_type,
            "uploaded_at": str(d.uploaded_at)
        })

    return jsonify(result), 200


# 3. Download a specific document
@document_bp.route("/api/documents/<int:document_id>/download", methods=["GET"])
def download_document(document_id):
    document = Document.query.get(document_id)
    if not document:
        return jsonify({"error": "Document not found"}), 404

    directory = os.path.dirname(document.file_path)
    filename = os.path.basename(document.file_path)

    return send_from_directory(directory, filename, as_attachment=True)