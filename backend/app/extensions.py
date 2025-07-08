from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


db = SQLAlchemy()
# allow cookies when the frontend is served from a different origin
cors = CORS(supports_credentials=True)
