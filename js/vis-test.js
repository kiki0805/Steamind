import { load_data } from './load_data.js';

var graph = load_data();

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeTableau10);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(250).strength(0.1))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

/*If we don't want the nodes to move out of frame:
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(250).strength(0.1))
    .force("charge", d3.forceManyBody())
    .force("x", d3.forceX())
    .force("y", d3.forceY());

svg
.attr("viewBox", [-width / 2, -height / 2, width, height])
*/


// render
setTimeout(function() {

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
            if (d.type == 1) {
                return 'user' // class cannot be ints
            } else {
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
            })
        );


    d3.selectAll('.user').append('rect')
        .data(graph.nodes)
        .attr('width', function(d) { return d.size })
        .attr('height', function(d) { return d.size })
        .attr('fill', '#ff9da7')
        .on('click', showprofile);

    d3.selectAll('.game').append('circle')
        .data(graph.nodes)
        .attr("r", function(d) { return d.size; })
        .attr("fill", function(d) {
            if (d.type == 2) {
                return '#edc949';
            } else if (d.type == 3) {
                return '#bab0ab';
            }
        });
    //Tooltip creation and CSS
    var tooltip = d3.select('#viz').append('div')
        .attr('id', 'tooltip')
        .attr('all', 'unset')
        .attr('style', 'position: absolute; opacity: 0;')


    //Cooltip is a static view for the steamuser 
    var cooltip = d3.select('#viz').append('div')
        .attr('id', 'cooltip')
        .attr('all', 'unset')
        .attr('style', 'position: absolute; opacity: 0;')
        .html("<img width=100% height=50% src=https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/a7/a77b23aff2b6bc2290f42c0d3db3c60cdb23da2a_full.jpg>" +
            "<p>" + "SteamUser: " + "nooooobkiiiiiz <br>" + "Games: 60" + "</p>"
        );



    d3.selectAll('circle')
        .on('click', function(d) {
            //Get attribute of circle 
            var data = d3.select(this)

            //Remove stroke from previous circle
            svg.selectAll('circle')
                .style("stroke", "#fff")
                .style("stroke-width", "1.5px")

            //Add html and position to tooltip based on attributes from the clicked circle. Shows header if it exists otherwise default
            if (data._groups[0][0].__data__.header) {
                d3.select('#tooltip')
                    .html(
                        "<img width=100% height=45% src=" + data._groups[0][0].__data__.header + '>' +
                        "<p><b>" + data._groups[0][0].__data__.name + "</b><br>" + "Genres: " + data._groups[0][0].__data__.genres + "<br>" +
                        "Reviewscore: " + ((data._groups[0][0].__data__.totalpositive / data._groups[0][0].__data__.totalreviews).toFixed(2) * 100) + "% Positive" + "<br>" + "Currentplayers: " + data._groups[0][0].__data__.currentonline + "</p>")
                    .transition().duration(300)
                    .style('opacity', 1)
                    .style('display', 'block')
                    .style('left', this.getBoundingClientRect().x - 300 + 'px')
                    .style('top', this.getBoundingClientRect().y - 60 + 'px')
                d3.select(this)
                    .style('stroke', 'black');
            } else {
                d3.select('#tooltip')
                    .html(
                        "<img width=100% height=45% src=https://cdn.cloudflare.steamstatic.com/store/about/social-og.jpg>" +
                        "<p><b>" + data._groups[0][0].__data__.name + "<br></b>" + "Playtime: " + data._groups[0][0].__data__.playtime + " minutes" + "<br>Owned" + "</p>")
                    .transition().duration(300)
                    .style('opacity', 1)
                    .style('display', 'block')
                    .style('left', this.getBoundingClientRect().x - 300 + 'px')
                    .style('top', this.getBoundingClientRect().y - 60 + 'px')
                d3.select(this)
                    .style('stroke', 'black');
            }
        });

    //Remove tooltip when user clicks somewhere else
    d3.select('body').on('click', function(e) {
        d3.select('#tooltip').style('opacity', 0).style('display', 'none')
        d3.select('#cooltip').style('opacity', 0).style('display', 'none')
    });


    node.append("title")
        .text(function(d) {
            if (d.name == '-') {
                return d.id;
            } else {
                return d.name;
            }
        });

    simulation.nodes(graph.nodes).on('tick', ticked);

    simulation.force('link').links(graph.links);

    function ticked() {
        link
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    };
    console.log('ok');
}, 1000);

function showprofile(d) {
    d3.select(this)
        .style('stroke', 'black');
    d3.select('#cooltip')
        .transition().duration(300)
        .style('opacity', 1)
        .style('display', 'block')
        .style('left', this.getBoundingClientRect().x - 300 + 'px')
        .style('top', this.getBoundingClientRect().y - 60 + 'px')
}

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