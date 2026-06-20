import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = os.getenv("DB_PORT", "5432")
DB_NAME     = os.getenv("DB_NAME", "postgres")
DB_USER     = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

SUPABASE_URL = os.getenv("SUPABASE_URL")

JWKS_URL = os.getenv("JWKS_URL")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "ES256")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

ALLOWED_MIME_TYPES = {
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE = 5 * 1024 * 1024
STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")