import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor

from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

_pool = None


class _PooledConnection:
    """Wraps a pooled connection so conn.close() returns it to the pool."""

    def __init__(self, conn, connection_pool):
        self._conn = conn
        self._pool = connection_pool

    def __getattr__(self, name):
        return getattr(self._conn, name)

    def close(self):
        self._pool.putconn(self._conn)


def _get_pool():
    global _pool
    if _pool is None:
        _pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            cursor_factory=RealDictCursor,
        )
    return _pool


def connection():
    return _PooledConnection(_get_pool().getconn(), _get_pool())
