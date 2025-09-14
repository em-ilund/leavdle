from flask import Blueprint, jsonify, render_template, request
from .models import Sketches
from .helpers import get_daily_lines

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    if request.method == 'GET':
        sketches = Sketches.query.all()
        return render_template('index.html', sketches=sketches)


@bp.route('/get_content')
def get_content():
    daily_lines = get_daily_lines()
    lines_list = [line.to_dict() for line in daily_lines]
    return jsonify(lines_list)
