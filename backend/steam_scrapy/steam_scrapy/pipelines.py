# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import logging
logger = logging.getLogger(__name__)
from db import *
from steam_scrapy.items import *

class GameDetailPipeline:
    collection_name = 'game_details'

    def process_item(self, item, spider):
        if type(item) is GameDevPubItem:
            query = Game.select().where(Game.appid==item['appid'])
            if not query.exists():
                return item
            game = query.first()
            game.developers = item['developers']
            game.publishers = item['publishers']
            game.save()
            logger.info(f"Updated dev pub of {item['appid']}.")
            return item
        if type(item) is GamePriceItem:
            query = Game.select().where(Game.appid==item['appid'])
            if not query.exists():
                return item
            game = query.first()
            game.price = item['price']
            game.save()
            logger.info(f"Updated price of {item['appid']}.")
            return item
        if type(item) is not GameDetailItem:
            return item
        query = Game.select().where(Game.appid==item['appid'])
        if query.exists() and query.first().name != "":
            logger.info(f"Game {item['appid']} is already recorded.")
            return item
        game = None
        if not query.exists():
            game = Game.create(
                name=item['name'],
                appid=item['appid'],
                header_img=item['header_image'],
                developers=item['developers'],
                publishers=item['publishers'],
                price=0 if item['is_free'] else item['price_overview']['initial'], # EUR
            )
            game.save()
        else:
            game = query.first()
            game.name=item['name']
            game.appid=item['appid']
            game.header_img=item['header_image']
            # game.price=0 if item['is_free'] else item['price_overview']['initial'] # EUR
            game.save()
        for genre in item['genres']:
            query = Genre.select().where(Genre.description==genre)
            if query.exists():
                genre_instance = query.first()
                if GenreProps.select().where(GenreProps.game==game, GenreProps.genre==genre_instance).exists():
                    continue
                GenreProps.create(game=game, genre=genre_instance).save()
                continue
            genre_instance = Genre.create(description=genre)
            GenreProps.create(game=game, genre=genre_instance).save()

        logger.info(f"Saved detail of {item['name']}.")
        return item


class GameTagsPipeline:
    collection_name = 'game_tags'

    def process_item(self, item, spider):
        if type(item) is not TagsItem:
            return item
        appid = item['appid']
        game = Game.select().where(Game.appid==appid).first()
        for tag in item['tags']:
            tag_instance = None
            if Tag.select().where(Tag.name==tag).exists():
                tag_instance = Tag.select().where(Tag.name==tag).first()
            else:
                tag_instance = Tag.create(name=tag)
                tag_instance.save()
            if not Tagged.select().where(Tagged.game==game, Tagged.tag==tag_instance).exists():
                Tagged.create(game=game, tag=tag_instance).save()
        logger.info(f"Saved tags of {appid}.")
        return item


class GameReviewsPipeline:
    collection_name = 'game_reviews'

    def process_item(self, item, spider):
        if type(item) is not ReviewsItem:
            return item
        appid = item['appid']
        game = Game.select().where(Game.appid==appid).first()
        game.total_positive = item['positive']
        game.total_negative = item['negative']
        total_positive = item['positive']
        total_negative = item['negative']
        sum_ = total_negative + total_positive
        if total_negative == -1 or total_positive == -1:
            ratio = -1
        elif sum_ == 0:
            ratio = -1
        else:
            ratio = total_positive / sum_
        game.positive_review_ratio = ratio
        game.save()
        for review in item['reviews']:
            if not Review.select().where(Review.game==game, Review.reviewer_steamid==review['steamid']).exists():
                Review.create(game=game, reviewer_steamid=review['steamid'], weight=review['weight'], voted_up=review['voted_up']).save()
        logger.info(f"Saved reviews of {appid}.")
        return item


class GameOnlinePipeline:
    collection_name = 'game_online'

    def process_item(self, item, spider):
        if type(item) is not OnlineItem:
            return item
        appid = item['appid']
        game = Game.select().where(Game.appid==appid).first()
        if game is None:
            return item
        game.current_online = item['count']
        game.save()
        logger.info(f"Saved online count of {appid}.")
        return item

from constants import STEAM_KEY, STEAMID, USER_REQUEST_DEPTH
class UserPipeline:
    collection_name = 'user'

    def process_item(self, item, spider):
        if type(item) is not UserItem:
            return item
        steamid = item['steamid']
        if User.select().where(User.steamid==steamid).exists():
            return item
        user = User.create(steamid=steamid, avatar=item['avatar'], personaname=item['personaname'])
        user.save()
        return item


class FriendshipPipeline:
    collection_name = 'friend'

    def process_item(self, item, spider):
        if type(item) is not FriendshipItem:
            return item
        steamid = item['steamid']
        user = User.select().where(User.steamid==steamid).first()
        for friend in item['friends']:
            friend_user = None
            query = User.select().where(User.steamid==friend)
            if not query.exists():
                friend_user = User.create(steamid=friend, avatar="", personaname="")
            else:
                friend_user = query.first()
            if not Friendship.select().where(Friendship.user1==user, Friendship.user2==friend_user).exists() and not Friendship.select().where(Friendship.user2==user, Friendship.user1==friend_user).exists():
                if (user.id > friend_user.id):
                    Friendship.create(user1=user, user2=friend_user).save()
                else:
                    Friendship.create(user2=user, user1=friend_user).save()
        logger.info(f"Saved friendship of {steamid}.")
        return item


class PlaytimePipeline:
    collection_name = 'playtime'

    def process_item(self, item, spider):
        if type(item) is not PlaytimeItem:
            return item
        steamid = item['steamid']
        user = User.select().where(User.steamid==steamid).first()
        for game in item['games']:
            appid = game['appid']
            playtime = game['playtime']
            game_instance = None
            query = Game.select().where(Game.appid==appid)
            if query.exists():
                game_instance = query.first()
            else:
                game_instance = Game.create(appid=appid, name="", header_img="", price=-1)
                game_instance.save()

            query = Playtime.select().where(Playtime.user==user, Playtime.game==game_instance)
            if query.exists():
                continue
            else:
                Playtime.create(user=user, game=game_instance, time=playtime).save()
        logger.info(f"Saved playtime of {steamid}.")
        return item


class RecommendedPipeline:
    collection_name = 'recommended'

    def process_item(self, item, spider):
        if type(item) is not RecommendedItem:
            return item
        steamid = item['steamid']
        user = User.select().where(User.steamid==steamid).first()
        for tag in item['tags']:
            tag_instance = None
            query = Tag.select().where(Tag.name==tag)
            if query.exists():
                tag_instance = query.first()
            else:
                tag_instance = Tag.create(name=tag)
                tag_instance.save()
            
            query = Recommended.select().where(Recommended.user==user, Recommended.tag==tag_instance)
            if query.exists():
                continue
            else:
                Recommended.create(user=user, tag=tag_instance).save()
        logger.info(f"Saved recommended of {steamid}.")
        return item
