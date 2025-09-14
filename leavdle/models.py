from leavdle import db


# Table containing every I Think You Should Leave sketch title
class Sketches(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sketch_name = db.Column(db.String, nullable=False)


# Table containing every recognizable line from every sketch
class Lines(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sketch_id = db.Column(db.Integer, db.ForeignKey('sketches.id'),
                          nullable=False)
    line_text = db.Column(db.String, nullable=False)
    sketch = db.relationship("Sketches")

    def to_dict(self):
        return {
            "id": self.id,
            "sketch_id": self.sketch_id,
            "line_text": self.line_text,
            "sketch_name": self.sketch.sketch_name if self.sketch else None
        }


# Table containing a history of which lines have been used
class LineHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    line_id = db.Column(db.Integer, db.ForeignKey('lines.id'),
                        nullable=False, unique=True)
    date = db.Column(db.Date, nullable=False, index=True)
    line = db.relationship("Lines")
