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
