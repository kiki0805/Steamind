export function load_data() {
    var links = [];
    var nodes = [];

    d3.json('backend/steam_scrapy/new_users.json')
        .then(function(data) {
            var user = data[0]; // main user
            nodes.push({ 'id': user.steamid, 'name': user.personaname, 'type': 1, 'size': 50 }); // type 1: user
            
            // Link user to owned games
            user.playtime.forEach(game => {
                var size = game.playtime / 60;
                // Decide size of game-node
                if (size < 10) {
                    var size = 10;
                }

                links.push({ 'source': user.steamid, 'target': game.game_name, 'width': 2 });
                nodes.push({
                    'id': game.game_name,
                    'name': game.game_name,
                    'playtime': game.playtime,
                    'genres': [],
                    'type': 2,
                    'size': size }) // type 2: user-owned game
            });
        })
    
    //Use the "old" new_games.json for demo
    d3.json('backend/steam_scrapy/new_games.json')
        .then(function(data) {
            var userGames = nodes.filter(game => game.type == 2); // get user-owned games

            // grab 50 first mock-data games
            for (var i = 0; i < 50; i++) {
                // check if user owns game
                if ((userGames.find(game => game.game_name == data[i].name)) == null) {
                    //console.log(data[i].name, ' is not owned.');
                    nodes.push({
                        'id': data[i].name, // has to be name for now for links to work
                        'name': data[i].name,
                        'header': data[i].header_img,
                        'currentonline': data[i].current_online,
                        'genres': data[i].genres,
                        'totalpositive': data[i].total_positive,
                        'totalnegative': data[i].total_negative,
                        'totalreviews': data[i].total_negative + data[i].total_positive,
                        'type': 3,
                        'size': 10
                    }); // if not owned, create new node
                }
            }

            var gamenodes = nodes.filter(game => game.type != 1);

            for(var i = 61; i < 72; i++) { // arbitrary numbers... user owns 60 games
                for(var j = 52; j < 73; j++) {
                    var common = (gamenodes[i].genres).filter(value => (gamenodes[j].genres).includes(value));
                    if(common != []) {
                        var source = nodes.filter(game => game.name == gamenodes[i].name);
                        var target = nodes.filter(game => game.name == gamenodes[j].name);
                        links.push({'source':source[0].name, 'target':target[0].name, 'width': 2 });
                    }
                }
            }
        });

    

    /*
        d3.json('backend/steam_scrapy/connection.json')
            .then(function(data) {
                var user_games = nodes.filter(game => game.type == 2);  // get user owned games

                // show 50 first games
                for(var i = 0; i < 100; i++) {
                    if( (user_games.find(game => game.name == data.nodes[i].name)) == undefined) { // if not owned by user, add node to graph
                        //console.log(data.nodes[i].name, " is not owned.");
                        nodes.push({'id':data.nodes[i].name, 'name':data.nodes[i].name, 'type':3, 'size':10}) // type 3: not owned
                    }else {
                        //console.log(data.nodes[i].name, " IS owned.");
                    }
                }

            // generate connections with the nodes we have
            for(var i = 0; i < data.links.length; i++) {
                if( (nodes.find(game => game.name == data.links[i].source)) && (nodes.find(game => game.name == data.links[i].target)) ) {
                    if( (data.links[i].common_tags + data.links[i].common_genres) > 10) { // if games have more than 10 common things
                        var width = 2;
                    }else {
                        var width = 0;
                    }
                    links.push({'source':data.links[i].source, 'target':data.links[i].target, 'width':width});
                }
            }
        });*/

    /*
    // trying second user with games that first user doesn't own
    nodes.push({'id':76561198240447068,'name':'anna','type':1,'size':5});
    links.push({'source':76561198240447068, 'target':'The Legend of Heroes: Trails in the Sky', 'width':2});
    links.push({'source':76561198240447068, 'target':'Sacred 2 Gold', 'width':2});
    links.push({'source':76561198240447068, 'target':'DARK SOULS\u2122 II: Scholar of the First Sin', 'width':2});
    links.push({'source':76561198240447068, 'target':'The Elder Scrolls\u00ae Online', 'width':2});
    links.push({'source':76561198240447068, 'target':"Sherlock Holmes: The Devil's Daughter", 'width':2});
    links.push({'source':76561198240447068, 'target':'Middle-earth\u2122: Shadow of War\u2122', 'width':2});
    */

    return { nodes, links };
};