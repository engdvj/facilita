import json


def login(client):
    res = client.post(
        "/api/auth/login", json={"username": "admin", "password": "admin123"}
    )
    assert res.status_code == 200


def register_user(client, username):
    res = client.post(
        "/api/auth/register", json={"username": username, "password": "pass"}
    )
    assert res.status_code == 201


def test_login(client):
    login(client)


def test_auth_me(client):
    login(client)
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    data = res.get_json()
    assert data["username"] == "admin"
    assert data["isAdmin"] is True

    client.post("/api/auth/logout")
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_create_and_list_link(client, app):
    login(client)
    res = client.post(
        "/api/links", json={"title": "Example", "url": "http://example.com"}
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["title"] == "Example"
    assert data["user"] == "admin"

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


def test_admin_category_visibility(client):
    login(client)
    res = client.post(
        "/api/categories",
        json={"name": "secret", "admin_only": True},
    )
    assert res.status_code == 201
    cat_id = res.get_json()["id"]

    res = client.post(
        "/api/links",
        json={"title": "Private", "url": "http://private.com", "category_id": cat_id},
    )
    assert res.status_code == 201
    link_id = res.get_json()["id"]

    # visible when logged in
    res = client.get("/api/categories")
    assert any(c["id"] == cat_id for c in res.get_json())
    res = client.get("/api/links")
    assert any(l["id"] == link_id for l in res.get_json())

    client.post("/api/auth/logout")

    res = client.get("/api/categories")
    assert all(c["id"] != cat_id for c in res.get_json())
    res = client.get("/api/links")
    assert all(l["id"] != link_id for l in res.get_json())


def test_user_private_links(client):
    register_user(client, "bob")
    res = client.post("/api/auth/login", json={"username": "bob", "password": "pass"})
    assert res.status_code == 200
    res = client.post("/api/links", json={"title": "Mine", "url": "http://m.com"})
    assert res.status_code == 201
    link_id = res.get_json()["id"]
    client.post("/api/auth/logout")

    register_user(client, "alice")
    res = client.post("/api/auth/login", json={"username": "alice", "password": "pass"})
    assert res.status_code == 200
    res = client.get("/api/links")
    assert all(l["id"] != link_id for l in res.get_json())
    client.post("/api/auth/logout")

    login(client)
    res = client.get("/api/links")
    assert any(l["id"] == link_id and l["user"] == "bob" for l in res.get_json())


def test_admin_can_assign_link_owner(client):
    register_user(client, "bob")
    login(client)
    users = client.get("/api/users").get_json()
    bob_id = next(u["id"] for u in users if u["username"] == "bob")
    res = client.post(
        "/api/links",
        json={"title": "For Bob", "url": "http://bob.com", "user_id": bob_id},
    )
    assert res.status_code == 201
    assert res.get_json()["user"] == "bob"


def test_non_admin_cannot_manage_admin_resources(client):
    register_user(client, "eve")
    res = client.post("/api/auth/login", json={"username": "eve", "password": "pass"})
    assert res.status_code == 200

    res = client.post("/api/colors", json={"value": "#ff00ff"})
    assert res.status_code == 403

    res = client.post("/api/categories", json={"name": "hacks"})
    assert res.status_code == 403

    res = client.post("/api/users", json={"username": "x", "password": "y"})
    assert res.status_code == 403


def test_admin_can_create_and_list_users(client):
    login(client)
    res = client.post(
        "/api/users",
        json={"username": "newuser", "password": "newpass", "is_admin": False},
    )
    assert res.status_code == 201
    user_id = res.get_json()["id"]

    res = client.get("/api/users")
    assert res.status_code == 200
    users = res.get_json()
    assert any(u["id"] == user_id and u["username"] == "newuser" for u in users)


def test_user_theme_persistence(client):
    login(client)
    res = client.post("/api/theme", json={"theme": {"--accent-color": "#111111"}})
    assert res.status_code == 200
    res = client.get("/api/theme")
    assert res.get_json()["theme"]["--accent-color"] == "#111111"

    client.post("/api/auth/logout")

    register_user(client, "bob")
    client.post("/api/auth/login", json={"username": "bob", "password": "pass"})
    res = client.get("/api/theme")
    assert res.get_json()["theme"] is None
