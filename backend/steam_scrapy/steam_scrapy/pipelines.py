# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import logging
logger = logging.getLogger(__name__)
from db import db, Game, Genre, GenreProps

class SteamScrapyPipeline:
    collection_name = 'game_details'
    def __init__(self):
        self.db = db

    def process_item(self, item, spider):
        if Game.select().where(Game.app_id==item['appid']).exists():
            return
        game = Game.create(
            name=item['name'],
            app_id=item['appid'],
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
            genre = Genre.create(id=genre['id'], description=genre['description'])
            GenreProps.create(game=game, genre=genre_instance).save()

        logger.info(item['name'])
        return item
