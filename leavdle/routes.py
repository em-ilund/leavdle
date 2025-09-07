from . import db, create_app
from datetime import date
from flask import Blueprint, render_template, request
from .models import Sketches, Lines

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET', 'POST'])
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