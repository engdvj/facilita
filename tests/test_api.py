import json

def login(client):
    res = client.post('/api/auth/login', json={'username': 'admin', 'password': 'admin123'})
    assert res.status_code == 200
    return res.get_json()['access_token']


def test_login(client):
    token = login(client)
    assert token


def test_create_and_list_link(client, app):
    token = login(client)
    res = client.post('/api/links', json={'title': 'Example', 'url': 'http://example.com'}, headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 201
    data = res.get_json()
    assert data['title'] == 'Example'

    res = client.get('/api/links')
    assert res.status_code == 200
    links = res.get_json()
    assert any(l['title'] == 'Example' for l in links)


def test_create_category_and_color(client, app):
    token = login(client)

    # create a color
    res = client.post('/api/colors', json={'value': '#ffffff'}, headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 201
    color_id = res.get_json()['id']

    # create a category using that color
    res = client.post(
        '/api/categories',
        json={'name': 'news', 'color': '#ffffff', 'icon': 'home'},
        headers={'Authorization': f'Bearer {token}'}
    )
    assert res.status_code == 201
    cat_id = res.get_json()['id']

    # verify listing
    res = client.get('/api/categories')
    assert any(c['id'] == cat_id for c in res.get_json())
