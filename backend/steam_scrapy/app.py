import subprocess
from flask_caching import Cache
from flask import Flask, jsonify, abort, request
from db import *
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

DEBUG = True
config = {
    "DEBUG": DEBUG,          # some Flask specific configs
    "CACHE_TYPE": "simple", # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300
}
cache = Cache(config=config)
app = Flask(__name__)
cache.init_app(app)

@app.route('/prefetched_users')
# @cache.cached(key_prefix='prefetched_users')
def prefetched_users():
    print('fetched')
    users = User.select().join(Playtime).where(Playtime.user.id==User.id).distinct()
    users = [user.steamid for user in users]
    return jsonify(users)

@app.route('/games/<steamid>')
def get_games_api(steamid):
    limit = request.args.get('limit')
    try:
        limit = int(limit)
    except:
        limit = 300
    data = cache.get(f'games_{steamid}_{limit}')
    if data is not None:
        return jsonify(data)
    
    print(f'fetch games for {steamid}')
    user = User.select().where(User.steamid==steamid)
    if (not user.exists()) or not Playtime.select().where(Playtime.user==user).exists():
        crawl_new_user(steamid, 15)
        user = User.select().where(User.steamid==steamid)
    if not user.exists():
        abort(400) 
    
    user = user.first()
    games = Game.select().where(Game.name!="")
    data = dump_games_for_user(games, user, limit)
    cache.set(f'games_{steamid}_{limit}', data)
    return jsonify(data)

@app.route('/filter_games', methods=['POST'])
def filter_games_api():
    content = request.json
    steamid = content.get('steamid', None)
    if steamid is None:
        data = filter_games(None, **content)
        return jsonify(data)

    user = User.select().where(User.steamid==steamid)
    if (not user.exists()) or not Playtime.select().where(Playtime.user==user).exists():
        crawl_new_user(steamid, 15)
        user = User.select().where(User.steamid==steamid)
    if not user.exists():
        abort(400)
    user = user.first()
    data = filter_games(user, **content)
    return jsonify(data)

if __name__ == '__main__':
    app.run(host= '0.0.0.0', debug=DEBUG, port=8000)
