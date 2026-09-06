import pytest


@pytest.mark.asyncio
async def test_register_and_login(client):
    r = await client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "password123",
            "role": "team_member",
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert "access_token" in body
    assert body["user"]["email"] == "test@example.com"

    r2 = await client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert r2.status_code == 200
    assert "access_token" in r2.json()


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    r = await client.post(
        "/api/auth/login",
        json={"email": "nope@example.com", "password": "wrong"},
    )
    assert r.status_code == 401