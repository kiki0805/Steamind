import requests
import json
from bs4 import BeautifulSoup

games = []
for i in range(1, 11):
    url = f'https://steamcharts.com/top/p.{i}'
    resp = requests.get(url)
    soup = BeautifulSoup(resp.content, 'html.parser')
    table = soup.find('table', {'id': 'top-games'})
    trs = table.tbody.find_all('tr')
    for tr in trs:
        game = tr.find('a')['href'].split('/')[-1]
        games.append(game)

with open('top-250.json', 'w') as f:
    f.write(json.dumps(games))
