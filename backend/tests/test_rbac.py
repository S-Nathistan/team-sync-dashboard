import pytest
from tests.conftest import register_user, auth_headers


@pytest.mark.asyncio
async def test_team_member_cannot_access_manager_endpoints(client):
    tm = await register_user(client, "tm@example.com", "tm1", role="team_member")
    token = tm["access_token"]

    r = await client.get("/api/reports/team", headers=auth_headers(token))
    assert r.status_code == 403

    r2 = await client.get("/api/dashboard/summary", headers=auth_headers(token))
    assert r2.status_code == 403

    r3 = await client.get("/api/users", headers=auth_headers(token))
    assert r3.status_code == 403


@pytest.mark.asyncio
async def test_manager_can_access_manager_endpoints(client):
    mgr = await register_user(client, "mg@example.com", "mgr1", role="manager")
    token = mgr["access_token"]

    r = await client.get("/api/dashboard/summary", headers=auth_headers(token))
    assert r.status_code == 200

    r2 = await client.get("/api/reports/team", headers=auth_headers(token))
    assert r2.status_code == 200


@pytest.mark.asyncio
async def test_team_member_cannot_view_others_report(client):
    a = await register_user(client, "a@example.com", "a1", role="team_member")
    b = await register_user(client, "b@example.com", "b1", role="team_member")

    # A creates a report
    from datetime import date, timedelta
    week = date.today() - timedelta(days=date.today().weekday())
    r = await client.post(
        "/api/reports",
        headers=auth_headers(a["access_token"]),
        json={
            "week_start": week.isoformat(),
            "week_end": (week + timedelta(days=6)).isoformat(),
            "tasks_completed": [],
            "tasks_planned": "",
            "blockers": [],
            "achievements": [],
            "hours_breakdown": [],
            "notes": "",
        },
    )
    assert r.status_code == 201
    report_id = r.json()["id"]

    # B tries to view — must be forbidden
    r2 = await client.get(
        f"/api/reports/{report_id}", headers=auth_headers(b["access_token"])
    )
    assert r2.status_code == 403


@pytest.mark.asyncio
async def test_review_workflow(client):
    member = await register_user(client, "m@example.com", "m1", role="team_member")
    manager = await register_user(client, "mg2@example.com", "mg2", role="manager")

    from datetime import date, timedelta
    week = date.today() - timedelta(days=date.today().weekday())

    # Create + submit
    r = await client.post(
        "/api/reports",
        headers=auth_headers(member["access_token"]),
        json={
            "week_start": week.isoformat(),
            "week_end": (week + timedelta(days=6)).isoformat(),
            "tasks_completed": [],
            "tasks_planned": "Do stuff",
            "blockers": [],
            "achievements": [],
            "hours_breakdown": [],
            "notes": "",
        },
    )
    report_id = r.json()["id"]

    submit = await client.post(
        f"/api/reports/{report_id}/submit",
        headers=auth_headers(member["access_token"]),
    )
    assert submit.status_code == 200
    assert submit.json()["status"] == "submitted"

    # Manager requests changes
    rc = await client.post(
        f"/api/reports/{report_id}/request-changes",
        headers=auth_headers(manager["access_token"]),
        json={"comment": "Add more detail please"},
    )
    assert rc.status_code == 200
    assert rc.json()["status"] == "needs_correction"

    # Member resubmits — creates new version
    resub = await client.post(
        f"/api/reports/{report_id}/submit",
        headers=auth_headers(member["access_token"]),
    )
    assert resub.status_code == 200
    assert resub.json()["status"] == "submitted"
    assert resub.json()["current_version"] == 2

    # Manager approves
    ap = await client.post(
        f"/api/reports/{report_id}/approve",
        headers=auth_headers(manager["access_token"]),
        json={"comment": "Much better"},
    )
    assert ap.status_code == 200
    assert ap.json()["status"] == "approved"