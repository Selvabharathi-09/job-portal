import os
from flask import Flask, send_from_directory
from app.config import Config
from app.extensions import db, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Static uploads serving route
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.hr_routes import hr_bp
    from app.routes.user_routes import user_bp
    from app.routes.job_routes import job_bp
    from app.routes.company_routes import company_bp
    from app.routes.notification_routes import notif_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(hr_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(notif_bp)

    @app.route('/api/health')
    def health_check():
        return {"status": "ok", "message": "Job Portal API is running successfully"}

    return app
