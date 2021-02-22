from playhouse.shortcuts import model_to_dict
from db import *

def dump_games():
    games = Game.select().where(Game.name!="")
    data = []
    for game in games:
        single = model_to_dict(game, backrefs=True, max_depth=2)
        single.pop('publishers')
        single.pop('review_set')
        genres = [g["genre"]['description'] for g in single.pop('genreprops_set')]
        single['genres'] = genres
        tags = [t['tag']['name'] for t in single.pop('tagged_set')]
        single['tags'] = tags
        single.pop('playtime_set')
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
            if game.name == "":
                continue
            playtime.append({
                'game_name': game.
                name,
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


def games_played_by_users():
    users = User.select().where(User.personaname!="")
    games = []
    for user in users:
        games += [pt.game for pt in user.playtime_set]
    games = list(set(games))
    games = filter(lambda game: game.name != "", games)
    return list(games)


class NodeType:
    Owned = 2
    OwnedByFriends = 3
    Else = 4

import itertools
def calculate_connection(user):
    # games = games_played_by_users()
    game_links = {'nodes':[], 'links': []}
    nodes = []
    games = []
    for pt in user.playtime_set:
        game = pt.game
        if game.name == '':
            continue
        games.append(game)
        nodes.append({
            'id': game.appid,
            'name': game.name,
            'type': NodeType.Owned
        })
    for friendship in user.friendship_set:
        friend = friendship.user1 if friendship.user1.steamid != user.steamid else friendship.user2
        if friend.personaname == "":
            continue
        for pt in friend.playtime_set:
            game = pt.game
            if game.name == '':
                continue
            if game in games:
                continue
            games.append(game)
            nodes.append({
                'id': game.appid,
                'name': game.name,
                'type': NodeType.OwnedByFriends
            })
    
    # for game in Game.select().where(Game.name!=""):
    #     if game in games:
    #         continue
    #     games.append(game)
    #     nodes.append({
    #         'id': game.appid,
    #         'name': game.name,
    #         'type': NodeType.Else
    #     })
        
    game_links['nodes'] = nodes

    links = []
    count = 0
    for game1, game2 in itertools.combinations(games, 2):
        if game1.name == '' or game2.name == '':
            continue
        count += 1
        if count % 1000 == 0:
            game_links['links'] = links
            yield game_links
            print(f'Current count: {count}')
        links.append({
            'source': game1.name,
            'target': game2.name,
            'source_id': game.appid,
            'target_id': game2.appid,
            'common_tags': len(common_tags(game1, game2)),
            'common_genres': len(common_genres(game1, game2)),
        })
    # game_links['links'] = links
    # return game_links


def common_tags(game1, game2):
    tagged1 = game1.tagged_set
    tags1 = [tagged.tag for tagged in tagged1]
    tagged2 = game2.tagged_set
    tags2 = [tagged.tag for tagged in tagged2]
    tags_common = list(set(tags1).intersection(tags2))
    return tags_common


def common_genres(game1, game2):
    genreprops1 = game1.genreprops_set
    genres1 = [genreprops.genre for genreprops in genreprops1]
    genreprops2 = game2.genreprops_set
    genres2 = [genreprops.genre for genreprops in genreprops2]
    genres_common = list(set(genres1).intersection(genres2))
    return genres_common
