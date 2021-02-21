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
        if type(item) is not GameDetailItem:
            return item
        if Game.select().where(Game.appid==item['appid']).exists():
            logger.info(f"Game {item['appid']} is already recorded.")
            return item
        game = Game.create(
            name=item['name'],
            appid=item['appid'],
            header_img=item['header_image'],
            developers=item['developers'],
            price=0 if item['is_free'] else item['price_overview']['initial'], # EUR
        )
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
        game.current_online = item['count']
        game.save()
        logger.info(f"Saved online count of {appid}.")
        return item