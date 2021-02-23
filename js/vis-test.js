import { load_data } from './load_data.js';

var graph = load_data();

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeSet1);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(500).strength(0.1))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width/2, height/2));


// render
setTimeout(function(){

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .style('stroke-width', function(d) { return d.width });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll('.nodes')
        .data(graph.nodes)
        .enter().append("g")
        .attr('class', function(d) {
            if(d.type == 1) {
                return 'user' // class cannot be ints
            }else {
                return 'game'
            }
        })
        .call(d3.drag() 
            .on("start", function(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", function(event, d) {
                //d3.select(this).raise().attr("cx", d.x = event.x).attr("cy", d.y = event.y);
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", function(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }));

    d3.selectAll('.user').append('rect')
        .data(graph.nodes)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', function(d) { return color(d.type); });

    d3.selectAll('.game').append('circle')
        .data(graph.nodes)
        .attr("r", function(d){
            if(d.type == 2) {
                return d.size;
            }else {
                return 5;
            }
        })
        .attr("fill", function(d) { return color(d.type); });
    
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

/*
function dragstarted(d) {
    //if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //d.fx = d.x;
    //d.fy = d.y;
};
  
function dragged(d) {
    //d.fy = d3.event.y;
    //d.fx = d3.event.x;
    //d.fy = d3.event.y;
};
  
function dragended(d) {
    //if (!d3.event.active) simulation.alphaTarget(0);
    //d.fx = null;
    //d.fy = null;
};*/