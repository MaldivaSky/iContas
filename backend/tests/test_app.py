from app import app


def test_home_status_code():
    client = app.test_client()
    res = client.get("/")
    assert res.status_code == 200
    assert b"API iContas" in res.data
