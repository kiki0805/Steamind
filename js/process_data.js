import {get_data} from './get_data.js';



function read() {
    var devs, tags;
    d3.json('backend/steam_scrapy/mock_data.json')
    .then(function(data) {
        devs = data.developers;
        tags = data.tags;
        return devs, tags;
    });
};

var devs, tags = read();
console.log(devs);