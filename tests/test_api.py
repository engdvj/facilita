import json


def login(client):
    res = client.post(
        "/api/auth/login", json={"username": "admin", "password": "admin123"}
    )
    assert res.status_code == 200


def test_login(client):
    login(client)


def test_create_and_list_link(client, app):
    login(client)
    res = client.post(
        "/api/links", json={"title": "Example", "url": "http://example.com"}
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["title"] == "Example"

    # update
    res = client.patch(f"/api/links/{data['id']}", json={"title": "Example2"})
    assert res.status_code == 200
    assert res.get_json()["title"] == "Example2"

    # delete
    res = client.delete(f"/api/links/{data['id']}")
    assert res.status_code == 200

    res = client.get("/api/links")
    assert res.status_code == 200
    links = res.get_json()
    assert all(l["id"] != data["id"] for l in links)


def test_create_category_and_color(client, app):
    login(client)

    # create a color
    res = client.post("/api/colors", json={"value": "#ffffff"})
    assert res.status_code == 201
    color_id = res.get_json()["id"]

    res = client.patch(f"/api/colors/{color_id}", json={"value": "#000000"})
    assert res.status_code == 200

    res = client.delete(f"/api/colors/{color_id}")
    assert res.status_code == 200

    # create a category using that color
    res = client.post(
        "/api/categories",
        json={"name": "news", "color": "#ffffff", "icon": "home"},
    )
    assert res.status_code == 201
    cat_id = res.get_json()["id"]

    res = client.patch(f"/api/categories/{cat_id}", json={"name": "tech"})
    assert res.status_code == 200

    res = client.delete(f"/api/categories/{cat_id}")
    assert res.status_code == 200

    # verify listing
    res = client.get("/api/categories")
    assert all(c["id"] != cat_id for c in res.get_json())
