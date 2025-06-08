from app import create_app
import os

# determine debug mode from environment variable (default True)
debug = os.getenv("FLASK_DEBUG", "1") not in ("0", "False", "false")

app = create_app(debug=debug)

if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "5000"))
    app.run(host=host, port=port, debug=debug)
