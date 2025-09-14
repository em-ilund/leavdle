import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


class Config:
    SQLALCHEMY_DATABASE_URI = (
        'sqlite:///' + os.path.join(BASE_DIR, 'instance', 'itysl.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
