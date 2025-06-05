from app import create_app
import os
# determine debug mode from environment variable (default True)
debug = os.getenv("FLASK_DEBUG", "1") not in ("0", "False", "false")

app = create_app(debug=debug)

if __name__ == '__main__':
    app.run(debug=debug)
