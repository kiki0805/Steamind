import scrapy
import json
from bs4 import BeautifulSoup
from steam_scrapy.items import *

class GameOnlineSpider(scrapy.Spider):
    name = "games-online"

    def start_requests(self):
        with open('allAppsId.json', 'r') as f:
            appids = json.loads(f.read())
        
        count = 0
        # appids = [726780,]
        id_range = [10, 2000]
        # for appid in appids:
        for appid in appids[id_range[0]: id_range[1]]:
            # if count > 10:
                # break
            url = f'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid={appid}'
            yield scrapy.Request(url, callback=self.parse_oneline, meta={'appid': appid})
            yield scrapy.Request('https://api.my-ip.io/ip', callback=self.test_ip)
            count += 1
            # break

    def test_ip(self, response):
        self.logger.info(response.text)

    # yield GameDetailItem/RetrieveDetailError
    def parse_oneline(self, response):
        appid = response.request.meta['appid']
        content = json.loads(response.text)
        yield OnlineItem(count=content['response']['player_count'],
        appid=appid)
        self.logger.info(f'[{str(appid):7s}]\tSucceed in parse_online.')

    