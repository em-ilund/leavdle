from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_talisman import Talisman

db = SQLAlchemy()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config['DEBUG'] = False
    
    csp = {
        'default-src': "'self'",
        'script-src': ["'self'", "https://cdn.jsdelivr.net"],
        'style-src': ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'img-src': ["'self'", "data:"],
    }

    Talisman(app, content_security_policy=csp)

    # Load main config
    app.config.from_object('leavdle.config.Config')

    # Load instance config if it exists
    app.config.from_pyfile('config.py', silent=True)

    db.init_app(app)

    from .routes import bp as main_bp
    app.register_blueprint(main_bp)

    # Sets up DB tables
    @app.cli.command("init-db")
    def init_db():
        db.create_all()
        print("Database initialized!")

    @app.shell_context_processor
    def make_shell_context():
        from .models import Sketches, Lines, LineHistory
        return {"db": db, "Sketches": Sketches,
                "Lines": Lines, "History": LineHistory}

    return app
