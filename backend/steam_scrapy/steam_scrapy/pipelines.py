# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import logging
logger = logging.getLogger(__name__)
from db import db, Game, Genre, GenreProps
from steam_scrapy.items import *

class GameDetailPipeline:
    collection_name = 'game_details'
    def __init__(self):
        self.db = db

    def process_item(self, item, spider):
        if type(item) is not GameDetailItem:
            return
        if Game.select().where(Game.appid==item['appid']).exists():
            logger.info(f"Game {item['appid']} is already recorded.")
            return
        game = Game.create(
            name=item['name'],
            appid=item['appid'],
            header_img=item['header_image'],
            website=item['website'],
            developers=item['developers'],
            price=0 if item['is_free'] else item['price_overview']['initial'], # EUR
        )
        game.save()
        for genre in item['genres']:
            query = Genre.select().where(Genre.id==int(genre['id']))
            if query.exists():
                genre_instance = query.first()
                if GenreProps.select().where(GenreProps.game==game, GenreProps.genre==genre_instance).exists():
                    continue
                GenreProps.create(game=game, genre=genre_instance).save()
                continue
            genre_instance = Genre.create(id=genre['id'], description=genre['description'])
            GenreProps.create(game=game, genre=genre_instance).save()

        logger.info(item['name'])
        return item


class GameTagsPipeline:
    collection_name = 'game_tags'
    def __init__(self):
        self.db = db

    def process_item(self, item, spider):
        if type(item) is not TagsItem:
            return
        pass


class GameReviewsPipeline:
    collection_name = 'game_reviews'
    def __init__(self):
        self.db = db

    def process_item(self, item, spider):
        if type(item) is not ReviewsItem:
            return
        pass
