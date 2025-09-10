from . import db, create_app
from datetime import date
from flask import Blueprint, jsonify, render_template, request, session
from localStoragePy import localStoragePy
from .models import Sketches, Lines
from .helpers import get_daily_lines

bp = Blueprint('main', __name__)


@bp.route('/')
def index():


    # TODO: Make it so that you can't just refresh the page and try again (progress is saved on refresh) (localStorage())
    # TODO: When finished guessing, show a page how many answers you got right, and the correct answers for each question
    # TODO: Add countdown to next one

    if request.method == 'GET':

        from leavdle.models import Sketches
        sketches = Sketches.query.all()
        
        return render_template('index.html', sketches=sketches)


@bp.route('/get_content')
def get_content():
    #probably dont even the sketch relationship
    daily_lines = get_daily_lines()
    lines_list = [line.to_dict() for line in daily_lines]
    return jsonify(lines_list)


@bp.route('/get_game_date')
def get_game_date():
    return(str(date.today()))