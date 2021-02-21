from playhouse.shortcuts import model_to_dict
from db import *

def dump_games():
    games = Game.select().where(Game.name!="")
    data = []
    for game in games:
        single = model_to_dict(game, backrefs=True, max_depth=2)
        data.append(single)
    return data


def dump_users():
    users = User.select().where(User.personaname!="")
    data = []
    for user in users:
        single = model_to_dict(user)
        friends = []
        for friendship in user.friendship_set:
            user1 = friendship.user1
            user2 = friendship.user2
            if user1.steamid == user.steamid:
                friends.append(user2.steamid)
            else:
                friends.append(user1.steamid)

        playtime = []
        games = []
        for pt in user.playtime_set:
            game = pt.game
            playtime.append({
                'appid': game.appid,
                'playtime': pt.time,
            })
            games.append(game.appid)

        tags = []
        for rk in user.recommended_set:
            tag = rk.tag
            tags.append(tag.name)

        single = {
            'friends': friends,
            'playtime': playtime,
            'games': games,
            'tags': tags,
            **single
        }
        data.append(single)
    return data
