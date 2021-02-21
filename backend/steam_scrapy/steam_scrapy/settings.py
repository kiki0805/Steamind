# Scrapy settings for steam_scrapy project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html

BOT_NAME = 'steam_scrapy'

SPIDER_MODULES = ['steam_scrapy.spiders']
NEWSPIDER_MODULE = 'steam_scrapy.spiders'


# Crawl responsibly by identifying yourself (and your website) on the user-agent
#USER_AGENT = 'steam_scrapy (+http://www.yourdomain.com)'

# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# Configure maximum concurrent requests performed by Scrapy (default: 16)
# CONCURRENT_REQUESTS = 5

# Configure a delay for requests for the same website (default: 0)
# See https://docs.scrapy.org/en/latest/topics/settings.html#download-delay
# See also autothrottle settings and docs
# DOWNLOAD_DELAY = 0.25
# The download delay setting will honor only one of:
#CONCURRENT_REQUESTS_PER_DOMAIN = 16
#CONCURRENT_REQUESTS_PER_IP = 16

# Disable cookies (enabled by default)
#COOKIES_ENABLED = False

# Disable Telnet Console (enabled by default)
#TELNETCONSOLE_ENABLED = False

# Override the default request headers:
#DEFAULT_REQUEST_HEADERS = {
#   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
#   'Accept-Language': 'en',
#}

# Enable or disable spider middlewares
# See https://docs.scrapy.org/en/latest/topics/spider-middleware.html
SPIDER_MIDDLEWARES = {
   'steam_scrapy.middlewares.SteamScrapySpiderMiddleware': 543,
}

# Enable or disable downloader middlewares
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
DOWNLOADER_MIDDLEWARES = {
   # 'steam_scrapy.middlewares.SteamScrapyDownloaderMiddleware': 543,
   'rotating_proxies.middlewares.RotatingProxyMiddleware': 610,
   'rotating_proxies.middlewares.BanDetectionMiddleware': 620,
}

# Enable or disable extensions
# See https://docs.scrapy.org/en/latest/topics/extensions.html
#EXTENSIONS = {
#    'scrapy.extensions.telnet.TelnetConsole': None,
#}

# Configure item pipelines
# See https://docs.scrapy.org/en/latest/topics/item-pipeline.html
ITEM_PIPELINES = {
   'steam_scrapy.pipelines.GameDetailPipeline': 300,
   'steam_scrapy.pipelines.GameTagsPipeline': 301,
   'steam_scrapy.pipelines.GameReviewsPipeline': 302,
   'steam_scrapy.pipelines.GameOnlinePipeline': 303,
   'steam_scrapy.pipelines.UserPipeline': 304,
   'steam_scrapy.pipelines.FriendshipPipeline': 305,
   'steam_scrapy.pipelines.PlaytimePipeline': 306,
   'steam_scrapy.pipelines.RecommendedPipeline': 307,
}

# Enable and configure the AutoThrottle extension (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/autothrottle.html
AUTOTHROTTLE_ENABLED = True
# The initial download delay
#AUTOTHROTTLE_START_DELAY = 5
# The maximum download delay to be set in case of high latencies
#AUTOTHROTTLE_MAX_DELAY = 60
# The average number of requests Scrapy should be sending in parallel to
# each remote server
#AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
# Enable showing throttling stats for every response received:
#AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings
HTTPCACHE_ENABLED = True
#HTTPCACHE_EXPIRATION_SECS = 0
#HTTPCACHE_DIR = 'httpcache'
HTTPCACHE_IGNORE_HTTP_CODES = [400, 401, 403, 404, 405, 406, 407, 408, 409, 500, 501, 502, 503, 504, 505, 506, 507, 508]
#HTTPCACHE_STORAGE = 'scrapy.extensions.httpcache.FilesystemCacheStorage'

# CUSTOMIZE
# LOG_ENABLED = True
LOG_LEVEL = 'INFO'
LOG_FILE = 'log.txt'

# ROTATING_PROXY_LIST = [
#    #  'http://medmjwyq-dest:1k8vvxalgyc7@209.127.191.180:9279',
#    #  'http://medmjwyq-dest:1k8vvxalgyc7@45.94.47.108:8152',
#    # '209.127.191.180:9279',
#    # '45.94.47.108:8152',
#    # '45.95.99.20:7580',
#    # '45.95.96.132:8691',
#    # '45.95.99.226:7786',
#    # '45.95.96.237:8796',
#    # '45.95.96.187:8746',
#    # '45.136.228.154:6209',
#    '193.8.56.119:9183',
#    '45.94.47.66:8110'
# ]
ROTATING_PROXY_LIST_PATH = 'proxies.txt'

# RETRY_HTTP_CODES = [500, 502, 503, 504, 522, 524, 408, 429, 403, 404]
# RETRY_TIMES = 5
HTTPERROR_ALLOWED_CODES  =[404]