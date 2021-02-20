import scrapy
import json
from steam_scrapy.items import GameDetailItem, RetrieveDetailError

class DetailsSpider(scrapy.Spider):
    name = "details"

    def start_requests(self):
        with open('allAppsId.json', 'r') as f:
            appids = json.loads(f.read())
        
        count = 0
        for appid in appids:
            if count > 10:
                break
            url = f'https://store.steampowered.com/api/appdetails/?appids={appid}'
            yield scrapy.Request(url, callback=self.parse, meta={'appid': appid})
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
        
        item = GameDetailItem(
            appid=appid,
            name=data['name'],
            is_free=data['is_free'],
            header_image=data['header_image'],
            website=data['website'],
            developers=data['developers'],
            publishers=data['publishers'],
            price_overview=data.get('price_overview', None),
            genres=data['genres']
        )
        yield item
        self.logger.info(f'[{str(appid):7s}]\tSucceed.')

    # yield GameDetailItem
    def parse_store_page(self, response):
        pass

    # yield TagsItem
    def parse_tags(self, response):
        pass

    # yield ReviewsItem
    def parse_reviews(self, response):
        pass
