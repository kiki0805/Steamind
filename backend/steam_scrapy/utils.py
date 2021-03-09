from playhouse.shortcuts import model_to_dict
from db import *
from addCategory import calcCategory
import json

category = json.load(open('categories.json'))

def dump_games():
    games = Game.select().where(Game.name!="", Game.developers==[])
    data = []
    games_id = []
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
        games_id.append(game.appid)
    with open('currentGames.json', 'w') as f:
        f.write(json.dumps(games_id))
    return data

def dump_games_for_user(owned_games, user, limit=300):
    data = []
    count = 0

    all_tags = set()
    all_developers = set()
    def process_game(game):
        single = model_to_dict(game, backrefs=True, max_depth=2)
        tags = [t['tag']['name'] for t in single.pop('tagged_set')]
        all_tags.update(set(tags))
        single['tags'] = tags
        single['category'] = calcCategory({'tags': tags}, category)
        single.pop('publishers')
        single.pop('review_set')
        genres = [g["genre"]['description'] for g in single.pop('genreprops_set')]
        single['genres'] = genres
        single.pop('playtime_set')
        single['developers'] = [dev.strip() for dev in single['developers']]
        all_developers.update(set(single['developers']))
        return single

    for game in owned_games:
        single = process_game(game)
        single['playtime'] = Playtime.select().where(Playtime.user==user, Playtime.game==game).first().time
        data.append(single)
        count += 1
        if count > limit:
            break
    amount = count
    
    games = Game.select().where(Game.name!="")
    for game in games:
        if Playtime.select().where(Playtime.user==user, Playtime.game==game).exists():
            continue
        single = process_game(game)
        single['playtime'] = -1
        data.append(single)
        count += 1
        if count > limit:
            break

    categorized = {}
    for game in data:
        cat = game['category']
        if cat in categorized:
            categorized[cat].append(game)
        else:
            categorized[cat] = [game, ]
    categorized = [{"name": k, "children": categorized[k]} for k in categorized]
    returned_data = {
        'user_info': {
            "amount_of_games": amount,
            **model_to_dict(user),
        },
        "tags": list(all_tags),
        "developers": list(all_developers),
        "games": categorized
    }
    return returned_data


def filter_games(user=None, **kwargs):
    games = Game.select().where(Game.name!="")
    if user is not None:
        owned = kwargs.get('owned', None)
        if owned:
            min_playtime = kwargs.get('min_playtime', 0)
            max_playtime = kwargs.get('max_playtime', float('inf'))
            games = filter(lambda game: Playtime.select().where(Playtime.user==user, Playtime.game==game, Playtime.time>=min_playtime, Playtime.time<=max_playtime).exists(), games)
        elif owned is False:
            games = filter(lambda game: not Playtime.select().where(Playtime.user==user, Playtime.game==game).exists(), games)

    cat = kwargs.get('category', None)
    min_popularity = kwargs.get('min_popularity', None)
    min_price = kwargs.get('min_price', None)
    max_price = kwargs.get('max_price', None)
    tags = kwargs.get('tags', None)
    genres = kwargs.get('genres', None)
    min_prr = kwargs.get('min_positive_review_ratio', None)
    max_prr = kwargs.get('max_positive_review_ratio' , None)
    developer = kwargs.get('developer', None)

    if cat is not None:
        games = filter(lambda game: calcCategory({'tags': [tagged.tag.name for tagged in game.tagged_set]}, category) == cat, games)
    if developer is not None:
        games = filter(lambda game: developer in game.developers, games)

    if min_popularity is not None:
        games = filter(lambda game: game.current_online>min_popularity, games)

    if tags is not None:
        def including_tags(game):
            game_tags = [tagged.tag.name for tagged in game.tagged_set]
            return set(tags).issubset(set(game_tags))
        games = filter(including_tags, games)
    if genres is not None:
        def including_genres(game):
            game_genres = [genreprops.genre.description for genreprops in game.genreprops_set]
            return set(game_genres).issubset(set(game_genres))
        games = filter(including_genres, games)
    
    if min_price is not None or max_price is not None:
        games = filter(lambda game: game.price >= (min_price if min_price is not None else -1) and game.price <= (max_price if max_price is not None else float('inf')), games)
    if min_prr is not None or max_prr is not None:
        games = filter(lambda game: game.positive_review_ratio >= (min_prr if min_prr is not None else -1) and game.positive_review_ratio <= (max_prr if max_prr is not None else float('inf')), games)

    return dump_games_for_user(games, user, kwargs.get('limit', 300))


def check_relevant(tags):
    recommended = ['Pinball', 'Hack and Slash', 'Action RPG', 'Online Co-Op', 'Third Person', 'Difficult', 'Free to Play', 'Open World', 'Co-op', 'Great Soundtrack', 'Fantasy', 'RPG', 'Story Rich', 'Atmospheric', 'Adventure', 'Multiplayer', 'Indie', 'Strategy', 'Action', 'Singleplayer']
    num_in_recommended = 0
    for tag in tags:
        if tag in recommended:
            num_in_recommended += 1
    if num_in_recommended > 3:
        return True
    return False


def dump_users():
    users = User.select().join(Playtime).where(Playtime.user.id==User.id).distinct()
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
    users = User.select().join(Playtime).where(Playtime.user.id==User.id).distinct()
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


def update_review_ratio():
    for game in Game.select().where(Game.name!=""):
        total_positive = game.total_positive
        total_negative = game.total_negative
        sum_ = total_negative + total_positive
        if total_negative == -1 or total_positive == -1:
            print('all -1')
            continue
        elif sum_ == 0:
            print('sum 0')
            continue
        ratio = total_positive / sum_
        game.positive_review_ratio = ratio
        game.save()
