from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config

    

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app)

    from app.routes.customer_routes import customer_bp
    from app.routes.policy_routes import policy_bp
    from app.routes.payment_routes import payment_bp
    from app.routes.claim_routes import claim_bp
    from app.routes.document_routes import document_bp
    from app.routes.report_routes import report_bp
    from app.routes.my_routes import my_bp
    from app.routes.policy_request_routes import request_bp
    from app.routes.notification_routes import notification_bp
    app.register_blueprint(customer_bp)
    app.register_blueprint(policy_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(claim_bp)
    app.register_blueprint(document_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(my_bp)
    app.register_blueprint(request_bp)
    app.register_blueprint(notification_bp)

    return app