export function load_data() {
    var links = [];
    var nodes = [];

    // Create user node
    nodes.push( {'id':123123, 'name':'User 1', 'type':1, 'size': 50} );

    d3.json('backend/steam_scrapy/mock_data.json')
        .then(function(data) {
            for(var i = 0; i < data.length; i++) {
                console.log(data[i].name)
                nodes.push( {'id':data[i].name, 'name':data[i].name, 'type':3, 'size': 2} ); // create category node
                links.push({ 'source':123123, 'target':data[i].name, 'width': 2 }); // link to user
                var games = data[i].children;

                games.forEach(game => {
                    nodes.push({
                        'id': game.appid,
                        'name': game.name,
                        'img': game.header_img,
                        'developers': game.developers,
                        'popularity': game.current_online,
                        'review': game.total_positive/(game.total_positive + game.total_negative),
                        'tags': game.tags,
                        'playtime':game.playtime,
                        'type': 2,
                        'size': 2 });

                    if(game.playtime == -1) {
                        links.push({ 'source':game.appid, 'target':game.category, 'width':2 });
                    }else {
                        links.push({ 'source':game.appid, 'target':123123, 'width':2 });
                    }

                    /*
                    if(game.playtime != -1) { // game owned by user
                        var a = game.playtime / 60;
                        // Decide size of game-node
                        if (a < 10) {
                            var a = 10;
                        }
                        nodes[nodes.length-1].size = a;
                        links.push({ 'source':game.appid, 'target':123123, 'width':2 });
                    }else { // game not belong to user, add to category node
                        links.push({ 'source':game.appid, 'target':game.category, 'width':2 });
                    }
                    */
                });
            }
        })
    return { nodes, links };
};