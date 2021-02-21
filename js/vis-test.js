// load data and put in nice structure
function load_data(){
    var links = [];
    var nodes = [];

    d3.json('../db/users.json', function(data) {
        var user = data[0]; // main user
        user.games.forEach(gameid => {    // link user to owned games
            links.push({'source':user.steamid, 'target':gameid, 'value':2});
            nodes.push({'id':gameid, 'type':2}) // type 2: user-owned game
        });
        nodes.push({'id':user.steamid, 'type':1}); // type 1: user
    })

    d3.json('../db/games.json', function(data) {
        // grab 50 first games
        for(var i = 0; i < 50; i++) {
            nodes.push({'id':data[i].appid, 'type':3}) // type 3: game not owned by user
        }
    })
    return {nodes, links};
}

// save nicely structured data as graph
var graph = load_data();

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

// render, we have to have timeout because d3.json returns immediately...
setTimeout(function(){
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g");

    var circles = node.append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.type); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function(d) { return d.id; });

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
