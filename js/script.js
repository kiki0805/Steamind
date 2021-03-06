function load_data(){
    var links = [];
    var nodes = [];


    d3.json('backend/steam_scrapy/new_users.json')
        .then(function(data) {
        var user = data[0]; // main user

        user.playtime.forEach(game => {    // link user to owned games
            var size = game.playtime/100; // decide size of game-node
            links.push({'source':user.steamid, 'target':game.game_name, 'value':2});
            nodes.push({'id':game.game_name, 'name': game.game_name, 'type':2, 'size':size}) // type 2: user-owned game
        });
        nodes.push({'id':user.steamid, 'name':user.personaname, 'type':1}); // type 1: user
    });

    d3.json('../backend/steam_scrapy/new_games.json')
        .then(function(data) {
        var userGames = nodes.filter(game => game.type == 2); // get user-owned games

        // grab 50 first mock-data games
        for(var i = 0; i < 50; i++) {
            // check if user owns game
            if( (userGames.find(game => game.game_name == data[i].name)) == null) {
                //console.log(data[i].name, ' is not owned.');
                nodes.push({'id':data[i].appid, 'name':data[i].name, 'type':3}); // if not owned, create new node
            }
        }
    });

    console.log(nodes, links);
    return {nodes, links};
};

var graph = load_data();

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemePaired);

//var simulation = d3.forceSimulation()
//    .force("link", d3.forceLink().id(function(d) { return d.id; }))
//    .force("charge", d3.forceManyBody())
//    .force("center", d3.forceCenter(width / 2, height / 2));