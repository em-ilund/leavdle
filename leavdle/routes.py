from . import db, create_app
from datetime import date
from flask import Blueprint, render_template, request
from .models import Sketches, Lines
from .helpers import get_daily_lines

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # A guess has been submitted
        return 'POST received'

    if request.method == 'GET':

        daily_lines = get_daily_lines()

        from leavdle.models import Sketches
        sketches = Sketches.query.all()
        
        return render_template('index.html', sketches=sketches, daily_lines=daily_lines)