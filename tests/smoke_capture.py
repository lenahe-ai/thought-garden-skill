"""Write fictional capture checks to a disposable local Thought Garden only."""
import json
import sys
import urllib.request
import uuid
from urllib.parse import urlparse

base = sys.argv[1].rstrip('/') if len(sys.argv) == 2 else ''
u = urlparse(base)
if u.scheme != 'http' or u.hostname not in ('127.0.0.1', 'localhost', '::1') or u.path or u.username or u.password or u.query or u.fragment:
    raise SystemExit('Supply an http loopback origin for a disposable local database.')

def call(path, body=None):
    req = urllib.request.Request(base + path, data=json.dumps(body).encode() if body is not None else None,
        headers={'Content-Type': 'application/json', 'Origin': base})
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.load(response)

originals = call('/api/cards')['cards']
text = 'Fictional smoke check ' + str(uuid.uuid4())
native = call('/api/capture', {'text': text, 'capture_id': str(uuid.uuid4())})
assert native['saved'] is True
rpc = call('/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': {
    'name': 'capture_thought', 'arguments': {'text': text, 'title': 'Fictional test', 'kind': 'inspiration', 'url': 'https://example.com/'}}})
assert not rpc['result'].get('isError'), rpc
receipt = json.loads(rpc['result']['content'][0]['text'])
assert receipt['saved'] and receipt['status'] == 'review'
cards = {c['id']: c for c in call('/api/cards')['cards']}
for capture_id in (native['id'], receipt['id']):
    assert cards[capture_id]['text'] == text
    assert cards[capture_id]['status'] == 'review'
assert cards[receipt['id']]['title'] == 'Fictional test'
assert cards[receipt['id']]['url'] == 'https://example.com/'
for c in originals:
    assert cards[c['id']] == c, 'Existing card changed'
print('PASS: both captures enter review; metadata and existing cards preserved.')
