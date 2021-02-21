# Define here the models for your spider middleware
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/spider-middleware.html

import scrapy
from scrapy import signals

# useful for handling different item types with a single interface
from itemadapter import is_item, ItemAdapter
from steam_scrapy.items import *
import logging
from constants import STEAM_KEY, USER_REQUEST_DEPTH
logger = logging.getLogger(__name__)


class SteamScrapySpiderMiddleware:
    # Not all methods need to be defined. If a method is not defined,
    # scrapy acts as if the spider middleware does not modify the
    # passed objects.

    @classmethod
    def from_crawler(cls, crawler):
        # This method is used by Scrapy to create your spiders.
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_spider_input(self, response, spider):
        # Called for each response that goes through the spider
        # middleware and into the spider.

        # Should return None or raise an exception.
        return None

    def process_spider_output(self, response, result, spider):
        # Called with the results returned from the Spider, after
        # it has processed the response.

        # Must return an iterable of Request, or item objects.
        for i in result:

            if type(i) is RetrieveDetailError:
                appid = i["appid"]
                # parse store page
                url = f'https://store.steampowered.com/app/{appid}'
                yield scrapy.Request(url, callback=spider.parse_store_page, meta={'appid': appid}, cookies={'birthtime': '28801','path' : '/',
            'domain' : 'store.steampowered.com'})
            elif type(i) is GameDetailItem:
                yield i
                appid = i["appid"]
                # parse tags
                url = f'https://store.steampowered.com/app/{appid}'
                yield scrapy.Request(url, callback=spider.parse_tags, meta={'appid': appid}, cookies={'birthtime': '28801','path' : '/',
            'domain' : 'store.steampowered.com'})
            elif type(i) is TagsItem:
                yield i
                appid = i["appid"]
                # parse reviews
                url = f'https://store.steampowered.com/appreviews/{appid}?json=1&language=all'
                yield scrapy.Request(url, callback=spider.parse_reviews, meta={'appid': appid})
            elif type(i) is ReviewsItem:
                yield i
                appid = i["appid"]
                # parse online count
                url = f'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid={appid}'
                yield scrapy.Request(url, callback=spider.parse_oneline, meta={'appid': appid})
            elif type(i) is OnlineItem:
                yield i
            elif type(i) is UserItem:
                yield i
                # parse play time
                url = f'http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={STEAM_KEY}&steamid={i["steamid"]}'
                yield scrapy.Request(url, callback=spider.parse_playtime, meta={'steamid': i["steamid"], 'depth': i['depth']})
            elif type(i) is PlaytimeItem:
                yield i
                # parse recommended
                url = f'https://store.steampowered.com/dynamicstore/userdata/?id={i["steamid"]}'
                yield scrapy.Request(url, callback=spider.parse_recommended, meta={'steamid': i["steamid"], 'depth': i['depth']})
                # if game not exists, yield
            elif type(i) is RecommendedItem:
                yield i
                # parse friends
                url = f'http://api.steampowered.com/ISteamUser/GetFriendList/v1/?key={STEAM_KEY}&steamid={i["steamid"]}'
                yield scrapy.Request(url, callback=spider.parse_friends, meta={'steamid': i["steamid"], 'depth': i['depth']})
            elif type(i) is FriendshipItem:
                yield i
                # parse users
                if i["depth"] > USER_REQUEST_DEPTH:
                    return
                for steamid in i['friends']:
                    url = f'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={STEAM_KEY}&steamids={steamid}'
                    yield scrapy.Request(url, callback=spider.parse, meta={'depth': i['depth']})
                
            

    def process_spider_exception(self, response, exception, spider):
        # Called when a spider or process_spider_input() method
        # (from other spider middleware) raises an exception.

        # Should return either None or an iterable of Request or item objects.
        pass

    def process_start_requests(self, start_requests, spider):
        # Called with the start requests of the spider, and works
        # similarly to the process_spider_output() method, except
        # that it doesn’t have a response associated.

        # Must return only requests (not items).
        for r in start_requests:
            yield r

    def spider_opened(self, spider):
        spider.logger.info('Spider opened: %s' % spider.name)


class SteamScrapyDownloaderMiddleware:
    # Not all methods need to be defined. If a method is not defined,
    # scrapy acts as if the downloader middleware does not modify the
    # passed objects.

    @classmethod
    def from_crawler(cls, crawler):
        # This method is used by Scrapy to create your spiders.
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_request(self, request, spider):
        # Called for each request that goes through the downloader
        # middleware.

        # Must either:
        # - return None: continue processing this request
        # - or return a Response object
        # - or return a Request object
        # - or raise IgnoreRequest: process_exception() methods of
        #   installed downloader middleware will be called
        return None

    def process_response(self, request, response, spider):
        # Called with the response returned from the downloader.

        # Must either;
        # - return a Response object
        # - return a Request object
        # - or raise IgnoreRequest
        return response

    def process_exception(self, request, exception, spider):
        # Called when a download handler or a process_request()
        # (from other downloader middleware) raises an exception.

        # Must either:
        # - return None: continue processing this exception
        # - return a Response object: stops process_exception() chain
        # - return a Request object: stops process_exception() chain
        pass

    def spider_opened(self, spider):
        spider.logger.info('Spider opened: %s' % spider.name)
