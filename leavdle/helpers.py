from sqlalchemy.sql import func
from datetime import date
from .models import Sketches, Lines, LineHistory
from . import db

def get_daily_lines():

    today = date.today()

    existing_lines = LineHistory.query.filter_by(date=today).all()
    # If today's lines already exist
    if existing_lines:
        return [entry.line for entry in existing_lines]

    # Pick 5 random sketch id's
    sketch_ids = [s.id for s in Sketches.query.order_by(func.random()).limit(5).all()]

    # Pich a random line for each sketch id, if it has not been picked before
    chosen_lines = []

    for sketch_id in sketch_ids:
        line = (Lines.query
                .filter(Lines.sketch_id == Sketches.id)
                .filter(~Lines.id.in_(db.session.query(LineHistory.line_id)))
                .order_by(func.random())
                .first())
        if line:
            chosen_lines.append(line)

    # Update LineHistory
    for line in chosen_lines:
        db.session.add(LineHistory(line_id=line.id, date=today))
    db.session.commit()

    return chosen_lines