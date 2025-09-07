from pathlib import Path
import sys
sys.path.append(str(Path(__file__).resolve().parents[1]))

import json
from leavdle import create_app, db
from leavdle.models import Sketches, Lines

app = create_app()

def seed_from_json(filepath):
    with open(filepath) as f:
        data = json.load(f)

    for sketch_data in data:
        sketch = Sketches(sketch_name=sketch_data['sketch_name'])
        db.session.add(sketch)
        db.session.flush()  # Flush to get the sketch ID

        for line_text in sketch_data['lines']:
            line = Lines(sketch_id=sketch.id, line_text=line_text)
            db.session.add(line)
    
    db.session.commit()
    print("Database seeded from", filepath)

if __name__ == '__main__':
    path = Path(__file__).resolve().parents[1] / 'data' / 'sketches.json'
    if path.exists():
        with app.app_context():
            seed_from_json(path)