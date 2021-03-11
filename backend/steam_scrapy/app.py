import subprocess
from flask_caching import Cache
from flask import Flask, jsonify, abort, request
from db import *
import hashlib
import requests
import json
from utils import dump_games_for_user, filter_games

def crawl_new_user(steamid, timeout=None):
    print(f'crawling steamid {steamid}')
    user_p = subprocess.Popen(['scrapy', 'crawl', 'users', '-a', f'steamid={steamid}'])
    game_p = subprocess.Popen(['scrapy', 'crawl', 'games', '-a', f'json_file=missingGames_{steamid}.json'])

    try:
        user_p.wait(timeout)
        game_p.wait(timeout)
    except:
        user_p.terminate()
        game_p.terminate()
        user_p.wait()
        game_p.wait()

from flask_cors import CORS
DEBUG = False
config = {
    "DEBUG": DEBUG,          # some Flask specific configs
    "CACHE_TYPE": "simple", # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300
}
cache = Cache(config=config)
app = Flask(__name__)
CORS(app)
cache.init_app(app)

@app.route('/prefetched_users')
# @cache.cached(key_prefix='prefetched_users')
def prefetched_users():
    print('fetched')
    users = User.select().join(Playtime).where(Playtime.user.id==User.id).distinct()
    users = [user.steamid for user in users]
    return jsonify(users)

def is_steamid_valid(steamid):
    resp = requests.get(f'https://steamidfinder.com/lookup/{steamid}/')
    if resp.status_code == 200:
        return True
    return False

def get_date_of_user(steamid, limit):
    data = cache.get(f'games_{steamid}_{limit}')
    if data is not None:
        return data
    
    print(f'fetch games for {steamid}')
    user = User.select().where(User.steamid==steamid)
    if (not user.exists()) or not Playtime.select().where(Playtime.user==user).exists():
        if not is_steamid_valid(steamid):
            abort(404)
        crawl_new_user(steamid, 15)
        user = User.select().where(User.steamid==steamid)
    if not user.exists():
        abort(400) 
    
    user = user.first()
    pts = Playtime.select().where(Playtime.user==user)
    games = [pt.game for pt in pts]
    data = dump_games_for_user(games, user, limit)
    cache.set(f'games_{steamid}_{limit}', data)
    return data


@app.route('/games/<steamid>')
def get_games_api(steamid):
    limit = request.args.get('limit')
    try:
        limit = int(limit)
    except:
        limit = 300
    data = get_date_of_user(steamid, limit)
    data.pop('raw_games')
    return jsonify(data)


@app.route('/filter_games/<steamid>', methods=['POST'])
def filter_games_api(steamid):
    content = request.json
    limit = request.args.get('limit')
    try:
        limit = int(limit)
    except:
        limit = 300
    hash_ = hashlib.md5(json.dumps(content).encode('utf-8')).digest()
    data = cache.get(f'{steamid}_{limit}_{hash_}')
    if data is not None:
        return jsonify(data)

    print(f'filter games for {steamid} with parameters {content}')

    raw_data = get_date_of_user(steamid, limit)
    data = filter_games(raw_data, **content)

    cache.set(f'{steamid}_{limit}_{hash_}', data)
    return jsonify(data)

if __name__ == '__main__':
    app.run(host= '0.0.0.0', debug=DEBUG, port=8100)
