from flask import Flask, render_template, request, jsonify
from datetime import date
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()


app = Flask(__name__, instance_relative_config=True)


# Load configs
app.config.from_object('config') # Load main config
app.config.from_pyfile('config.py', silent=True)  # Load instance config if it exists


db.init_app(app)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # A guess has been submitted
        return 'POST received'

    if request.method == 'GET':
        # A line from a sketch is presented
        # The user gets to guess which sketch it's from
        # After guessing, the correct answer is revealed, and they get to guess a new line
        # Repeat 5 times, then show score
        
        return render_template('index.html')


# Run once to set up DB tables
@app.cli.command("init-db")
def init_db():
    db.create_all()
    print("Database initialized!")

@app.shell_context_processor
def make_shell_context():
    from models import Sketches, Lines
    return {"db": db, "Sketches": Sketches, "Lines": Lines}