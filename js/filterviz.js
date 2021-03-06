import { create_legend } from './create_legend.js'

var steamtree = [];
var currentfilter = "";
var currentSteamid = '76561197963264495';

var vizParent = document.getElementById("viz");
var width = (vizParent.clientWidth),
    height = 720,
    root;
var $select;

// manually create legend
create_legend();

function fetchCustomSteamid() {
    const steamid = document.getElementById("mySteamid").value;
    currentSteamid = steamid;
    updateVis();
}

//Fetch user games for viz 
//Old link "http://3.129.66.238:8000/games/76561197963264495?limit=300";
var fetchusergames = `https://cryptic-river-41340.herokuapp.com/games/${currentSteamid}?limit=300`;

async function fetchSteamids() {
    const response = await fetch(`https://cryptic-river-41340.herokuapp.com/prefetched_users`);
    const steamidL = await response.json();
    var steamid_dropdown = d3.select('#selUser');
    steamid_dropdown.append('option')
        .attr('value', () => { return steamidL[0] })
        .text(`Default: ${steamidL[0]}`);
    steamidL.shift();
    steamidL.forEach(steamid => {
        steamid_dropdown.append('option')
            .attr('value', () => { return steamid })
            .text(steamid)
    });
    $('#selUser').on('change', function() {
        if (this.value == "") return;
        currentSteamid = this.value;
        updateVis();
    });
    $(document).ready(function() {
        $select = $('select').selectize({
            sortField: 'text'
        });
    });
};

var element = document.getElementById("fetchCustomSteamid");
element.addEventListener("click", fetchCustomSteamid);

async function fetchGames() {
    const response = await fetch(fetchusergames);
    const g = await response.json();
    return g;
};

$.LoadingOverlay('show');
fetchGames().then(post => {
    devL = post.developers;
    tagL = post.tags;
    vis = resetVis = post.games;
    create_filter_options();

    steamtree.push({ "name": "Steamuser", "children": post.games });
    steamtree = JSON.stringify(Object.assign({}, steamtree));
    steamtree = JSON.parse(steamtree);
    fetchSteamids();

    viz(steamtree[0]);
    $.LoadingOverlay('hide');
});

var svg = d3.select("#viz").append("svg")
    .attr("id", "svgViz")
    .attr("width", width)
    .attr("height", height);



function viz(tree) {
    d3.selectAll("#svgViz").remove();
    d3.select("#tooltip").remove();

    //It there's only one category, remove rect
    if (tree.children.length == 1) {
        tree = tree.children[0];
    }
    svg = d3.select("#viz").append("svg")
        .attr("id", "svgViz")
        .attr("width", width)
        .attr("height", height);

    var link = svg.selectAll(".link"),
        node = svg.selectAll(".node");

    //Force for nodes 
    var force = d3.layout.force()
        .linkDistance(30)
        .charge(-150)
        .gravity(.18)
        .size([width, height])
        .on("tick", tick);


    //Appending the svg to the #viz-div 

    root = tree
    update();
    //Updates the current nodes 
    function update() {

        var nodes = flatten(root),
            links = d3.layout.tree().links(nodes);

        // Restart the force layout.
        force
            .nodes(nodes)
            .links(links)
            .start();

        var drag = force.drag()
            .on("dragstart", dragstart);


        function dblclick(d) {
            d3.select(this).classed("fixed", d.fixed = false);
        }

        function dragstart(d) {
            if (d3.event.defaultPrevented) return;
            d3.select(this).classed("fixed", d.fixed = true);
        }
        // Update links.
        link = link.data(links, function(d) { return d.target.id; });

        link.exit().remove();

        link.enter().insert("line", ".node")
            .attr("class", "link");

        // Update nodes.
        node = node.data(nodes, function(d) { return d.id; });

        node.exit().remove();

        node.enter().append("g")
            .attr("class", function(d) {
                //User get the class user
                if (d.name == "Steamuser") {
                    return "user"
                } //Categories get the class category 
                else if (d.name == "Strategy & Simulation Games" || d.name == "Shooter Games" || d.name == "RPG Games" || d.name == "Puzzle & Arcade Games" || d.name == "Software") {
                    return "category"
                } else if (d.name == "") {
                    return "empty";
                } else { return "node" }
            })
            .style("fill", color)
            .style("stroke", '#fff')
            .call(drag);

        //Append circle to games
        d3.selectAll('.node').append("circle")
            .attr("r", function(d) {

                if (d.playtime > 0) {
                    return 8 + Math.min(6, d.playtime / 60) + Math.min(3, d.playtime / 1000) + Math.min(15, d.playtime / 10000);
                } else {
                    return 8;
                }

            })
            .style("stroke", '#fff')
            .on("dblclick", dblclick)
            .on("click", gameclick)
            .on('mouseover', function(d) { nodeHover(d, 0) });

        //Append rect to user
        d3.selectAll('.user').append("rect")
            .attr('width', 50)
            .attr('height', 50)
            .style("fill", "rgb(78, 121, 167)")
            .style("stroke", '#fff')
            .on("dblclick", dblclick)
            /* .on('click', function() {
                 // hinder everything from resetting by just dragging on user
                 var cLength = (selection.categories).length;
                 var tLength = (selection.tags).length;
                 var dLength = (selection.developers).length;
                 var popularityV = selection.popularity;
                 var priceV = selection.price;

                 // if selection not totally empty
                 if (!(!cLength && !tLength && !dLength && !popularityV && priceV == 100)) {
                     reset();
                 }
             })*/ //Removed this, let's leave it for the reset button hehe :)
            .on('mouseover', function(d) { nodeHover(d, 1); });

        //Append circle to category
        d3.selectAll('.category').append('polygon')
            .attr('points', '0,-25 -20,10 20,10')
            .style('stroke', '#fff')
            .style('fill', 'black') // change this later so it depends on category
            .on("dblclick", dblclick)
            //.on('click', filtercategory) Removed this, too many options for filtering :) 
            .on('mouseover', function(d) { nodeHover(d, 0); });

        d3.selectAll('.legend-filter')
            .on('mouseover', function(d) {
                d3.select(this).attr('r', '12');
            })
            .on('mouseout', function(d) {
                d3.select(this).attr('r', '10');
            })
            .on('click', function() {
                var value = this.attributes.value.value;
                if ((selection.categories).includes(value)) {
                    removeSelection('categories', value, 1);
                } else {
                    addSelection('categories', value, 1);
                }
            });

        //If we want text, looks horrible 
        //nodeEnter.append("text")
        //  .attr("dy", ".35em")
        //  .text(function(d) { return d.name; });
    }

    // filter category via triangle click
    function filtercategory(d) {
        if (d3.event.defaultPrevented) return;
        if (d == currentfilter) { // if we click on category already filtered
            currentfilter = "";

            // if category only one currently being displayed
            if ((selection.categories).length <= 1) {
                removeSelection('categories', d.name, 1); // remove category from filter and update
            } else {
                viz(steamtree[0]); // show tree from root node
            }
        } else {
            if (currentfilter != "") {
                removeSelection('categories', currentfilter.name, 0); // remove old category from selection
            }
            currentfilter = d;
            addSelection('categories', d.name, 0); // update with new category
            viz(d);
        }
    }
    //Tooltip 
    var tooltip = d3.select('#legend').append('div')
        .attr('id', 'tooltip')
        .attr('all', 'unset')
        .attr('style', 'position: absolute; opacity: 0;');

    d3.select('body').on('mouseover', function(e) {
        d3.select('#tooltip_hover').style('opacity', 0).style('display', 'none');
    });
    //Remove when clicking outside tooltip     - Not needed in new  
    //window.addEventListener('click', function(e) {
    //    if (document.getElementById('tooltip').contains(e.target)) {
    // Clicked in box consoe
    //     return;
    //  } else {
    //      d3.select('#tooltip').style('opacity', 0).style('display', 'none');
    //  }
    // });


    //Tooltip but only for hovering
    var tooltip_hover = d3.select('#viz').append('div')
        .attr('id', 'tooltip_hover')
        .attr('all', 'unset')
        .attr('style', 'position: absolute; opacity: 0;');


    function tick() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        svg.selectAll("g").attr("transform", function(d) {
            return "translate(" +
                Math.max(7, Math.min(width - 7, d.x)) + "," +
                Math.max(7, Math.min(height - 7, d.y)) + ")";
        });
    }

    function color(d) {

        if (d.playtime > -1) {
            return "rgb(78, 121, 167)";
        }

        // return d._children ? "#3182bd" // collapsed package
        //     :
        //     d.children ? "#c6dbef" // expanded package
        //     :
        //     "#fd8d3c"; // leaf node

        //console.log(d)
        var color
        var rating = d.positive_review_ratio
        if (typeof rating == 'undefined' || rating < 0.0) { rating = 0.0 }

        if (d.category == "Strategy & Simulation Games") {
            color = d3.hsl(0, Math.max(0.3, rating), 0.15 + 0.35 * rating)
        } else if (d.category == "Shooter Games") {
            color = d3.hsl(90, Math.max(0.3, rating), 0.15 + 0.35 * rating)
        } else if (d.category == "RPG Games") {
            color = d3.hsl(35, Math.max(0.3, rating), 0.15 + 0.35 * rating)
        } else if (d.category == "Puzzle & Arcade Games") {
            color = d3.hsl(300, Math.max(0.3, rating), 0.15 + 0.35 * rating)
        } else {
            color = "#000000"
        };


        return color

    }

    function nodeHover(d, toggle) {
        var txt;
        if (toggle) {
            txt = "That's you!"
        } else {
            txt = d.name;
        }

        d3.select('#tooltip_hover')
            .html('<p>' + txt + '</p>')
            .transition().duration(400)
            .style('opacity', 1)
            .style('display', 'block')
            .style('left', (d3.event.pageX - 300) + "px")
            .style('top', (d3.event.pageY - 50) + "px");
    }

    // When clicking on a user, display their information
    /*
    function userclick(d) {
        d3.select('#tooltip')
        .html("<img width=100% height=45% src=" + d.avatar + '>' +
            "<p><b>" + d.name + "</b><br>" + "Amount of owned games: " + d.amount_of_games + "</p>")
        .transition().duration(300)
        .style('opacity', 1)
        .style('display', 'block')
        .style('left', this.getBoundingClientRect().x - 300 + 'px')
        .style('top', this.getBoundingClientRect().y - 60 + 'px');
    }
    */

    //When user clicks on a game 
    function gameclick(d) {
        if (d3.event.defaultPrevented) return;
        d3.select(this)
            .style('stroke', 'black')
            .style('stroke-width', '2px');

        if (d.header_img) {
            //This creates the buylink
            //var buylink = `<a class="buy_link" target=_blank href=https://store.steampowered.com/app/${d.appid}><b>Click here to see in Steam store.</b></a>`
            var buylink = "<input type=button class=customButton value=Buy name onclick=window.open('" + "https://store.steampowered.com/app/" + d.appid + "') />";

            function dropdown() {
                //This creates the dropdown menu for the tags 
                var tag;
                for (var i = 0; i < d.tags.length; i++) {
                    tag += '<option>' + d.tags[i] + '</option>'
                }
                return tag;
            }

            var tags = dropdown();
            const priceStr = d.price == -1 ? "Unavailable" : `$ ${d.price}`;
            if (d.playtime > -1) {
                //Goes here if the game is owned 
                d3.select('#tooltip')
                    .html("<img width=100% height=45% src=" + d.header_img + '>' +
                        "<p><b>" + d.name + "</b><br>" + "Category: " + d.category + "<br>" +
                        "Reviewscore: " + ((d.total_positive / (d.total_negative + d.total_positive)).toFixed(2) * 100) + "% Positive" +
                        "<br>" + "Price: " + priceStr + "<br>" + "Playtime: " + (d.playtime / 60).toFixed(1) + " hrs" + "<select id=selectNumber> <option>Tags</option>" + tags + "</select><br>" +
                        "<b>This game is owned by you.</b></p>")
                    .transition().duration(300)
                    .style('opacity', 1)
                    .style('display', 'block')
                    //.style('left', this.getBoundingClientRect().x - 300 + 'px')
                    //.style('top', this.getBoundingClientRect().y - 60 + 'px');
            } else {
                function dropdown() {
                    var tag;
                    for (var i = 0; i < d.tags.length; i++) {
                        tag += '<option>' + d.tags[i] + '</option>'
                    }
                    return tag;
                }
                var tags = dropdown();
                const priceStr = d.price == -1 ? "Unavailable" : `$ ${d.price}`;
                d3.select('#tooltip')
                    .html("<img width=100% height=45% src=" + d.header_img + '>' +
                        "<p><b>" + d.name + "</b><br>" + "Category: " + d.category + "<br>" +
                        "Reviewscore: " + ((d.total_positive / (d.total_negative + d.total_positive)).toFixed(2) * 100) + "% Positive" +
                        "<br>" + "Price: " + priceStr + "<br>" +
                        "<select id=selectNumber> <option>Tags</option>" + tags + "</select>" + "<br>" + buylink +
                        "</p>")
                    .transition().duration(300)
                    .style('opacity', 1)
                    .style('display', 'block')
                    // .style('left', this.getBoundingClientRect().x - 300 + 'px')
                    //.style('top', this.getBoundingClientRect().y - 60 + 'px');
            }

        } else {
            d3.select('#tooltip')
                .html("No info")
                .transition().duration(300)
                .style('opacity', 1)
                .style('display', 'block')
                // .style('left', this.getBoundingClientRect().x - 300 + 'px')
                // .style('top', this.getBoundingClientRect().y - 60 + 'px');
        }
    }

    // Toggle children on click. For parent nodes 
    function click(d) {
        if (d3.event.defaultPrevented) return; // ignore drag
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update();
    }

    // Returns a list of all nodes under the root.
    function flatten(root) {
        var nodes = [],
            i = 0;

        function recurse(node) {
            if (node.children) node.children.forEach(recurse);
            if (!node.id) node.id = ++i;
            nodes.push(node);
        }

        recurse(root);
        return nodes;
    }

}
/****** FILTER *******/
/*** VARIABLES ***/
var price = 100;
var price_filter = d3.select('#price_filter');

var pop = 0;
var pop_filter = d3.select('#pop_filter');

// Keeps track of current filters
var selection_div = d3.select("#selection");
var selection = {
    'tags': [],
    'categories': [],
    'developers': [], // don't seem to have a default
    'price': price,
    'popularity': pop
};

/*** SLIDER FILTERS ***/
// price filter
price_filter.append('h5')
    .attr('id', 'price_val')
    .text((`Max price: \$${price}`)); // default value

price_filter.append('input')
    .attr('type', 'range')
    .attr('min', 1)
    .attr('max', 100)
    .attr('value', price)
    .attr('step', 1)
    .attr('id', 'price_slider')
    .on('input', function() {
        price = +this.value;
        d3.select('#price_val').text((`Max price: \$${price}`));
    })
    .on('change', function() { updateFilterSlider('price', this.value) });

// popularity filter
pop_filter.append('h5')
    .attr('id', 'pop_val')
    .text(('Min popularity: ' + pop + '%')); // default value

pop_filter.append('input')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', 100)
    .attr('value', pop)
    .attr('step', 1)
    .attr('id', 'pop_slider')
    .on('input', function() {
        pop = +this.value;
        d3.select('#pop_val').text(('Min popularity: ' + pop + '%'));
    })
    .on('change', function() { updateFilterSlider('popularity', this.value) });

/*** DROP-DOWN FILTERS ***/
/* Filter options */
var vis, resetVis;
var tagL, devL;

//This has been replaced with real data in the first fetch, see line 20-23. 
/*d3.json('backend/steam_scrapy/mock_data.json') // replace this with actual fetched data
    .then(function(data) {
        devL = data.developers;
        tagL = data.tags;
        vis = resetVis = data.games;
        create_filter_options();
});*/

function create_filter_options() {
    tagL.sort();
    devL.sort();
    /* Adding values for each filter drop down */
    var tag_dropdown = d3.select('#tags');
    tagL.forEach(tag => {
        tag_dropdown.append('option')
            .attr('value', () => { return tag })
            .text(tag)
    });

    var dev_dropdown = d3.select('#developers');
    devL.forEach(developer => {
        dev_dropdown.append('option')
            .attr('value', () => { return developer })
            .text(developer)
    });
};

// When user filters
$('.filter').on('change', function() { // changing pop or price
    if (this.value == "") {
        return; // don't filter on default values (choose tag...)
    } else {
        addSelection(this.id, this.value, 1);
    }
});

/*** FUNCTIONS ***/
/* Add attribute to selection list and as a list item on the page */
function addSelection(type, value, update) {
    if (value != -1) {
        // limit devs to only one at a time
        if (type == 'developers' && selection[type].length >= 1) {
            removeSelection(type, selection[type][0], 0);
        }

        if (!selection[type].includes(value)) { // check if item already in filter
            selection[type].push(value);
            selection_div.append('li')
                .attr('id', function() {
                    return value.toLowerCase().replace(/[^a-zA-Z+]+/gi, "");
                })
                .attr('class', 'filteredSelection')
                .text('??? ' + value)
                .on('click', function() { removeSelection(type, value, 1) })
        }
        //console.log('updated selection: ', selection);
        if (update) {
            updateVis();
        }
    }
};

/* Remove attribute from selection list and its html element */
function removeSelection(type, value, update) {
    var index = (selection[type]).indexOf(value);
    if (index != -1) {
        (selection[type]).splice(index, 1);
    }
    var tmp = '#' + value.toLowerCase().replace(/[^a-zA-Z+]+/gi, "");
    // regex from stack overflow /^[^a-z]+|[^\w:.-]+/gi
    d3.select(tmp).remove();

    //console.log('updated selection: ', selection);
    if (!update) {
        viz(steamtree[0]);
    } else {
        updateVis();
    }
};

/* Update attribute in selection */
function updateFilterSlider(type, value) {
    selection[type] = parseInt(value);
    updateVis();
};

/* Reset visualization */
d3.select('#resetVizButton').on('click', function() {
    reset();
});

function reset() {
    // reset filter selection
    if (d3.event.defaultPrevented) return;
    console.log($select)
    for (var i = 0; i < $select.length - 2; i++) {
        var element = $select[i];
        element.selectize.clear(true);
    }
    d3.selectAll('.filteredSelection').remove();
    pop = 0;
    price = 100;
    d3.select('#pop_slider').attr('value', pop);
    d3.select('#pop_val').text(('Min popularity: ' + pop + '%'));
    d3.select('#price_slider').attr('value', price);
    d3.select('#price_val').text(('Max price: ' + price + '$'));


    // reset everything!
    selection.categories = [];
    selection.tags = [];
    selection.developers = [];
    selection.price = price;
    selection.popularity = pop;
    start = 1;
    updateVis();
}

/* Show loading screen when start/reset */
var start = 1;

function updateVis() {
    //console.log("updateVis: ", selection);
    $.LoadingOverlay('show');
    /*
    if(start) {
        $.LoadingOverlay('show');
    }*/

    if ((selection.categories).length != 0) {
        sendRequestCat();
    } else {
        sendRequestNoCat();
    }

    //start = 0;
};

$.ajaxSetup({
    contentType: "application/json; charset=utf-8"
});

/* Send request with categories */
function sendRequestCat() {

    $.post(`https://cryptic-river-41340.herokuapp.com/filter_games/${currentSteamid}?limit=300`,
        JSON.stringify({
            "categories": selection.categories, // optional
            "max_price": selection.price, // optional, in dollars
            "tags": selection.tags, // optional, array of tags
            "min_positive_review_ratio": (selection.popularity / 100), // optional, maximum of ratio of positive review
            "developers": selection.developers, // optional
        }),
        //update steamtree
        function(data, status) {
            if (status !== "success") {
                alert('failed to fetch data');
                return;
            }
            //console.log('ok', data.games);
            steamtree = [];
            steamtree.push({ "name": "Steamuser", "children": data.games });
            steamtree = JSON.stringify(Object.assign({}, steamtree));
            steamtree = JSON.parse(steamtree);
            viz(steamtree[0]);
            /*
            // show only category if one category filtered
            if((selection.categories).length == 1) {
                //currentfilter = steamtree[0].children[0];
                currentfilter = steamtree[0].children[0];
                viz(currentfilter);
            }
            */

            $.LoadingOverlay('hide');
        });
};

function sendRequestNoCat() {
    $.post(`https://cryptic-river-41340.herokuapp.com/filter_games/${currentSteamid}?limit=300`,
        JSON.stringify({
            "max_price": selection.price, // optional, in dollars
            "tags": selection.tags, // optional, array of tags
            "min_positive_review_ratio": (selection.popularity / 100), // optional, maximum of ratio of positive review
            "developers": selection.developers, // optional
        }),
        //update steamtree
        function(data, status) {
            if (status !== "success") {
                alert('failed to fetch data');
                return;
            }
            //console.log('ok', data.games);
            steamtree = [];
            steamtree.push({ "name": "Steamuser", "children": data.games });
            steamtree = JSON.stringify(Object.assign({}, steamtree));
            steamtree = JSON.parse(steamtree);
            viz(steamtree[0]);
            $.LoadingOverlay('hide');
            /*
            // show only category if one category filtered
            if((selection.categories).length == 1) {
                //currentfilter = steamtree[0].children[0];
                currentfilter = steamtree[0].children[0];
                viz(currentfilter);
            }
            */
        });
}
/*
$("#send_request").click(function() {
    if ((selection.categories).length != 0) {
        sendRequestCat();
    } else {
        sendRequestNoCat();
    }
});
*/