export function get_data() { // fetch info from to backend
    var devs, tags;
    // pre-stored fetch
    d3.json('backend/steam_scrapy/mock_data.json')
        .then(function(data) {
            devs = data.developers;
            tags = data.tags;
        });
}

    // live fetch
    /*
    // 76561197963264495 prefetched user id
    return fetch('http://3.129.66.238:8000/games/76561197963264495?limit=300')
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
    */