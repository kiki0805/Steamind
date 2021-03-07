# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class GameDetailItem(scrapy.Item):
    appid = scrapy.Field()
    name = scrapy.Field()
    is_free = scrapy.Field()
    header_image = scrapy.Field()
    developers = scrapy.Field()
    publishers = scrapy.Field()
    price_overview = scrapy.Field()
    genres = scrapy.Field()


class GameDevPubItem(scrapy.Item):
    appid = scrapy.Field()
    developers = scrapy.Field()
    publishers = scrapy.Field()


class GamePriceItem(scrapy.Item):
    appid = scrapy.Field()
    price = scrapy.Field() # in dollars


class RetrieveDetailError(scrapy.Item):
    appid = scrapy.Field()


class TagsItem(scrapy.Item):
    tags = scrapy.Field()
    appid = scrapy.Field()


class ReviewsItem(scrapy.Item):
    positive = scrapy.Field()
    negative = scrapy.Field()
    reviews = scrapy.Field()
    appid = scrapy.Field()


class OnlineItem(scrapy.Item):
    count = scrapy.Field()
    appid = scrapy.Field()


class UserItem(scrapy.Item):
    steamid = scrapy.Field()
    avatar = scrapy.Field()
    personaname = scrapy.Field()
    depth = scrapy.Field()


class FriendshipItem(scrapy.Item):
    steamid = scrapy.Field()
    friends = scrapy.Field()
    depth = scrapy.Field()


class PlaytimeItem(scrapy.Item):
    games = scrapy.Field()
    steamid = scrapy.Field()
    depth = scrapy.Field()


class RecommendedItem(scrapy.Item):
    steamid = scrapy.Field()
    tags = scrapy.Field()
    depth = scrapy.Field()
