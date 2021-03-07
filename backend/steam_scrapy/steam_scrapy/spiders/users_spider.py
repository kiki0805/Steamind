import scrapy
import json
from bs4 import BeautifulSoup
from steam_scrapy.items import *
from constants import STEAM_KEY, STEAMID, USER_REQUEST_DEPTH

class UserSpider(scrapy.Spider):
    name = "users"

    def __init__(self, steamid):
        self.steamid = steamid

    def start_requests(self):
        self.logger.info(f'Crawling steamid {self.steamid}')
        url = f'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={STEAM_KEY}&steamids={self.steamid}'
        yield scrapy.Request(url, callback=self.parse, meta={'depth': 0})

    # yield UserItem
    def parse(self, response):
        depth = response.request.meta['depth']
        content = json.loads(response.text)
        player = content['response']['players'][0]
        yield UserItem(steamid=player['steamid'], avatar=player['avatarfull'], personaname=player['personaname'], depth=depth)
        
    def parse_playtime(self, response):
        depth = response.request.meta['depth']
        steamid = response.request.meta['steamid']
        content = json.loads(response.text)
        games = content['response'].get('games', [])
        games = [{'appid': game['appid'], 'playtime': game['playtime_forever']} for game in games]
        yield PlaytimeItem(steamid=steamid, games=games, depth=depth)
    
    def parse_recommended(self, response):
        depth = response.request.meta['depth']
        steamid = response.request.meta['steamid']
        content = json.loads(response.text)
        tags = content['rgRecommendedTags']
        tags = [tag['name'] for tag in tags]
        yield RecommendedItem(tags=tags, steamid=steamid, depth=depth)
    
    def parse_friends(self, response):
        depth = response.request.meta['depth'] + 1
        steamid = response.request.meta['steamid']
        content = json.loads(response.text)
        friends = content['friendslist']['friends']
        friends = [friend['steamid'] for friend in friends]
        yield FriendshipItem(friends=friends, steamid=steamid, depth=depth)
