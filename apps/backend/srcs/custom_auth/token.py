import base64
import hashlib
import hmac
import json


def encode_b64url(code: bytes) -> bytes:
    return base64.urlsafe_b64encode(code).replace(b"=", b"")


def get_token(sub):
    header = {"typ": "JWT", "alg": "HS256"}
    payload = {"sub": sub}
    segments = []

    json_header = json.dumps(header, separators=(",", ":")).encode()
    json_payload = json.dumps(payload, separators=(",", ":")).encode()

    segments.append(encode_b64url(json_header))
    segments.append((encode_b64url(json_payload)))
