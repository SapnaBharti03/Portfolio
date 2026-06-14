import os

from flask import Flask
from flask_cors import CORS

from app.routes import api_bp

from app.config import (
    JWKS_URL,
    SUPABASE_URL
)

app = Flask(__name__)

# =========================
# App Configuration
# =========================

app.config["JWKS_URL"] = JWKS_URL
app.config["SUPABASE_URL"] = SUPABASE_URL


# =========================
# CORS Configuration
# =========================

CORS(
    app,
    origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sapnas-portfolio.onrender.com",
    ],
    supports_credentials=True,
    allow_headers=[
        "Content-Type",
        "Authorization"
    ]
)


# =========================
# Register Blueprints
# =========================

app.register_blueprint(api_bp)


# =========================
# Health Check Route
# =========================

@app.get("/health")
def health():
    return {
        "success": True,
        "message": "Backend running successfully"
    }


# =========================
# Run Server
# =========================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8001,
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
    )