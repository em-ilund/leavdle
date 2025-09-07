from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    # Load configs
    app.config.from_object('leavdle.config.Config') # Load main config
    app.config.from_pyfile('config.py', silent=True)  # Load instance config if it exists


    db.init_app(app)


    from .routes import bp as main_bp
    app.register_blueprint(main_bp)


    with app.app_context():
        from . import routes, models


    # Sets up DB tables
    @app.cli.command("init-db")
    def init_db():
        db.create_all()
        print("Database initialized!")

    @app.shell_context_processor
    def make_shell_context():
        from .models import Sketches, Lines
        return {"db": db, "Sketches": Sketches, "Lines": Lines}


    return app