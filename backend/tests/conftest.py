import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport

from main import app
from app.infrastructure.database import create_tables, drop_tables


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def client():
    await drop_tables()
    await create_tables()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    await drop_tables()


async def register_user(client, email, username, password="testpass123", role="team_member"):
    resp = await client.post(
        "/api/auth/register",
        json={
            "email": email,
            "username": username,
            "full_name": username.title(),
            "password": password,
            "role": role,
        },
    )
    return resp.json()


def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}