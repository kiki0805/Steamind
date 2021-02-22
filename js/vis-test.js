function load_data(){
    var links = [];
    var nodes = [];

    d3.json('../db/new_users.json', function(data) {
        var user = data[0]; // main user
        user.playtime.forEach(game => {    // link user to owned games
            var size = game.playtime/100; // decide size of game-node
            links.push({'source':user.steamid, 'target':game.game_name, 'value':2});
            nodes.push({'id':game.game_name, 'name': game.game_name, 'type':2, 'size':size}) // type 2: user-owned game
        });
        nodes.push({'id':user.steamid, 'name':user.personaname, 'type':1}); // type 1: user
    })

    d3.json('../db/new_games.json', function(data) {
        userGames = nodes.filter(game => game.type == 2); // get user-owned games

        // grab 50 first mock-data games
        for(var i = 0; i < 50; i++) {
            // check if user owns game
            if( (userGames.find(game => game.game_name == data[i].name)) == null) {
                //console.log(data[i].name, ' is not owned.');
                nodes.push({'id':data[i].appid, 'name':data[i].name, 'type':3}); // if not owned, create new node
            }
        }
    });
    return {nodes, links};
};

graph = load_data();

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));


// render
setTimeout(function(){
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .style('stroke-width', function(d) { return d.value });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g");
    
    var circles = node.append("circle")
        .attr("r", function(d){
            if(d.type == 2) {
                return d.size;
            }else {
                return 5;
            }
        })
        .attr("fill", function(d) { return color(d.type); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on('click', function(d, i) {
                // d : data object, i : index of d within collection
                console.log('you clicked on ' + d.id);
            })
    
    node.append("title")
        .text(function(d) { 
            if(d.name == '-') {
                return d.id;
            }else {
                return d.name;
            }
        });
    
    simulation.nodes(graph.nodes).on('tick', ticked);

    simulation.force('link').links(graph.links);
    
    function ticked(){
        link
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node.attr('transform', function(d){
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    };
    console.log('ok');
}, 3000);

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
};
  
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
};
  
function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
};