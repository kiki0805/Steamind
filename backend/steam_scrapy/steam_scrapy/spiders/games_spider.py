import scrapy
import json
from bs4 import BeautifulSoup
from steam_scrapy.items import *

class GamesSpider(scrapy.Spider):
    name = "games"

    def start_requests(self):
        # with open('currentGames.json', 'r') as f:
        # with open('top-250.json', 'r') as f:
        with open('missingGames.json', 'r') as f:
        # with open('allAppsId.json', 'r') as f:
            appids = json.loads(f.read())
        
        count = 0
        appids = [682110, 707220, 722400, 725870]
        id_range = [3000, 5000]
        for appid in appids:
        # for appid in appids[id_range[0]: id_range[1]]:
            # if count > 10:
            #     break

            # url = f'https://store.steampowered.com/api/appdetails/?appids={appid}'
            # yield scrapy.Request(url, callback=self.parse, meta={'appid': appid})
            price_url = f'https://club.steam250.com/app/{appid}'
            yield scrapy.Request(price_url, callback=self.parse_price, meta={'appid': appid})
            count += 1

    # yield GameDetailItem/RetrieveDetailError
    def parse(self, response):
        appid = response.request.meta['appid']
        content = json.loads(response.text)
        values = list(content.values())[0]
        success = values.get('success')
        if not success:
            self.logger.warning(f'[{str(appid):7s}]\tFailed to retrieve detail.')
            yield RetrieveDetailError(appid=appid)
            return
        data = values.get('data')
        if data['type'] != 'game':
            # self.logger.info(f'[{str(appid):7s}]\tNot game.')
            return
        price_overview = data.get('price_overview', None)
        if price_overview is None:
            price_overview = {'initial': -1}
        item = GameDetailItem(
            appid=appid,
            name=data['name'],
            is_free=data['is_free'],
            header_image=data['header_image'],
            developers=data.get('developers', []),
            publishers=data['publishers'],
            price_overview=price_overview,
            genres=[genre['description'] for genre in data.get('genres', [])]
        )
        yield item
        self.logger.info(f'[{str(appid):7s}]\tSucceed in parse.')

    def parse_price(self, response):
        appid = response.request.meta['appid']
        soup =  BeautifulSoup(response.text, 'html.parser')
        price = soup.find_all('div',{'class':'price'})
        if len(price) == 0:
            yield GamePriceItem(
                appid=appid,
                price=-1
            )
            return
        price = price[0]
        spans = price.find_all('span', {'class': 'was'}) 
        if spans != []:
            price = spans[0].text.strip()
        else:
            price = price.text.strip()
        if price == "Free":
            price = 0
        else:
            price = float(price[1:])
        yield GamePriceItem(
            appid=appid,
            price=price
        )

    # yield GameDetailItem
    def parse_store_page(self, response):
        appid = response.request.meta['appid']
        if 'app' not in response.request.url:
            self.logger.warning(f'[{str(appid):7s}]\tEmpty store page.')
            return
        # if 'Oops, sorry!' in response.css("h2.pageheader").get():
        if response.css("h2.pageheader").get() is not None:
            self.logger.warning(f'[{str(appid):7s}]\tError store page.')
            self.logger.warning(response.css('span.error::text').get())
            return

        # discount = response.css("dev.discount_original_price::text").get()
        price = None
        # if discount is not None:
        #     price = discount.strip()
        #     price = float(price[:-1].replace(',','.'))
        # else:
        #     price_try = response.css("div.game_purchase_price::text").getall()
        #     for p in price_try:
        #         if 'Demo' in p:
        #             continue
        #         if price_try == 'Free to Play':
        #             price = 0
        #             break
        #         self.logger.info(price_try)
        #         price = float(price_try[0][:-1].replace(',','.'))
        #         break

        soup =  BeautifulSoup(response.text, 'html.parser')
        divs = soup.find_all('div',{"class":"popup_menu_subheader"})
        genre_div = None
        for div in divs:
            if div.text == 'Game Genres':
                genre_div = div
                break
        genre_as = genre_div.parent.find_all('a')
        genres = [genre.text.strip() for genre in genre_as]
        genres = list(filter(lambda v: v!='More Popular Tags...', genres))
        dev_rows = response.css("div.dev_row").css("a::text").getall()
        item = GameDetailItem(
            appid=appid,
            name=response.css("div.apphub_AppName::text").get(),
            is_free=price == 0,
            header_image=f'https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg',
            developers=response.css("#developers_list a::text").getall(),
            publishers=[] if dev_rows == [] else dev_rows[1],
            price_overview={'initial': price if price is not None else -1},
            genres=genres
        )
        yield item
        self.logger.info(f'[{str(appid):7s}]\tSucceed in parse_store_page.')

    # yield TagsItem
    def parse_tags(self, response):
        appid = response.request.meta['appid']
        soup =  BeautifulSoup(response.text, 'html.parser')
        tags_div = soup.find('div',{"class":"glance_tags popular_tags"})
        tags_div = [] if tags_div is None else tags_div.find_all('a')
        tags = [tag.text.strip() for tag in tags_div]
        yield TagsItem(tags=tags, appid=appid)
        self.logger.info(f'[{str(appid):7s}]\tSucceed in parse_tags.')

    # yield ReviewsItem
    def parse_reviews(self, response):
        appid = response.request.meta['appid']
        content = json.loads(response.text)
        success = content['success']
        if not success:
            self.logger.warning(f'[{str(appid):7s}]\tFailed to retrieve reviews.')
            return
        summary = content['query_summary']
        reviews = content['reviews']
        reviews = [{'steamid': review['author']['steamid'],
            'weight': review['weighted_vote_score'],
            'voted_up': review['voted_up']}
            for review in reviews
        ]
        
        item = ReviewsItem(
            appid=appid,
            reviews=reviews,
            positive=summary['total_positive'],
            negative=summary['total_negative'],
        )
        yield item

    # yield OnlineItem
    def parse_oneline(self, response):
        appid = response.request.meta['appid']
        content = json.loads(response.text)
        if response.status == 404:
            yield OnlineItem(count=content['response']['result'], appid=appid)
        else:
            yield OnlineItem(count=content['response']['player_count'], appid=appid)
        self.logger.info(f'[{str(appid):7s}]\tSucceed in parse_online.')

