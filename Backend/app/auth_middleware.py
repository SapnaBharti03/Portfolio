from functools import wraps

from flask import current_app, g, jsonify, request

import jwt
from jwt import PyJWKClient, get_unverified_header


def get_token():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    if not auth_header.startswith("Bearer "):
        return None

    return auth_header.split(" ")[1]


def verify_jwt(token):
    header = get_unverified_header(token)
    # print("JWT header:", header)
    jwks_client = PyJWKClient(
        current_app.config["JWKS_URL"]
    )

    signing_key = jwks_client.get_signing_key_from_jwt(token)

    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=["ES256"],
        issuer=f"{current_app.config['SUPABASE_URL']}/auth/v1",
        options={
            "verify_aud": False
        }
    )

    return payload


def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):

        token = get_token()

        if not token:
            return jsonify({
                "error": "Missing token"
            }), 401

        try:    
            payload = verify_jwt(token)

            g.user = {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role")
            }

        except Exception as e:
            return jsonify({
                "error": str(e)
            }), 401

        return fn(*args, **kwargs)

    return wrapper