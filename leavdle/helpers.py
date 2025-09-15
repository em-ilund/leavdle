from sqlalchemy.sql import func
from datetime import datetime, timezone
from .models import Sketches, Lines, LineHistory
from . import db
import logging


def reduce_history_entries():
    KEPT_HISTORY = 100
    MAX_HISTORY = 500
    # Check line-count in line_history table, and clear it if it's getting full
    count = db.session.query(func.count(LineHistory.id)).scalar()
    if count >= MAX_HISTORY:

        cutoff = (
            db.session.query(LineHistory.id)
            .order_by(LineHistory.id.desc())
            .offset(KEPT_HISTORY)
            .limit(1)
            .scalar()
        )
        db.session.query(LineHistory).filter(LineHistory.id < cutoff).delete(synchronize_session=False)
        db.session.commit()
        print("line_history table entries reduced")


def get_daily_lines():

    today_utc = datetime.now(timezone.utc).date()

    existing_lines = LineHistory.query.filter_by(date=today_utc).all()
    if existing_lines:
        return [entry.line for entry in existing_lines]

    # Purge oldest entries to the history table if getting full
    reduce_history_entries()

    LINE_AMOUNT = 5
    chosen_lines = []
    insufficient_data = False
    used_sketches = set()
    used_line_ids = {entry.line_id for entry in LineHistory.query.all()}
    available_sketches = Sketches.query.count()

    while len(chosen_lines) < LINE_AMOUNT:
        # Pick a random sketch not already used today
        sketch = (
            Sketches.query
            .filter(~Sketches.id.in_(used_sketches))
            .order_by(func.random())
            .first()
        )
        if not sketch:
            insufficient_data = True
            break

        line = (
            Lines.query
            .filter(Lines.sketch_id == sketch.id)
            .filter(~Lines.id.in_(used_line_ids))
            .order_by(func.random())
            .first()
        )
        if line:
            chosen_lines.append(line)

        used_sketches.add(sketch.id)

        if len(used_sketches) >= available_sketches:
            insufficient_data = True
            break

    # Fallback if line selection fails somehow
    if insufficient_data:
        # Select 5 random lines without constraints
        chosen_lines.clear()
        chosen_lines = (
            Lines.query.order_by(func.random()).limit(LINE_AMOUNT).all()
        )
        logging.warning("""
                        Not enough data,
                        lines were selected without constraints.
                        """)

        # Add to history table if no conflicting line id
        for line in chosen_lines:
            if line.id not in used_line_ids:
                db.session.add(LineHistory(line_id=line.id, date=today_utc))
        db.session.commit()

        return chosen_lines

    # Update LineHistory
    for line in chosen_lines:
        db.session.add(LineHistory(line_id=line.id, date=today_utc))
    db.session.commit()

    return chosen_lines
