var steamtree = [];
var currentfilter;

var width = 1280,
    height = 720,
    root;


//Fetch user games for viz 
//Old link "http://3.129.66.238:8000/games/76561197963264495?limit=300";
var fetchusergames = "https://cryptic-river-41340.herokuapp.com/games/76561197963264495?limit=300";

async function fetchGames() {
    const response = await fetch(fetchusergames);
    const g = await response.json();
    return g;
}

fetchGames().then(post => {
    devL = post.developers;
    tagL = post.tags;
    vis = resetVis = post.games;
    create_filter_options();

    steamtree.push({ "name": "Steamuser", "children": post.games });
    steamtree = JSON.stringify(Object.assign({}, steamtree));
    steamtree = JSON.parse(steamtree);
    viz(steamtree[0]);

});

var svg = d3.select("#viz").append("svg")
    .attr("id", "svgViz")
    .attr("width", width)
    .attr("height", height);

function viz(tree) {
    d3.selectAll("#svgViz").remove();

    svg = d3.select("#viz").append("svg")
        .attr("id", "svgViz")
        .attr("width", width)
        .attr("height", height);

    var link = svg.selectAll(".link"),
        node = svg.selectAll(".node");

    //Force for nodes 
    var force = d3.layout.force()
        .linkDistance(50)
        .charge(-60)
        .gravity(.05)
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
                else if (d.name == "Strategy & Simulation Games" || d.name == "Shooter Games" || d.name == "RPG Games" || d.name == "Puzzle & Arcade Games") {
                    return "category"
                } else if (d.name == "") {
                    return "empty";
                } else { return "node" }
            })
            .style("fill", color)
            .style("stroke", '#fff')
            .style("stroke-width", "1,5px")
            .call(force.drag);

        //Append circle to games
        d3.selectAll('.node').append("circle")
            .attr("r", function(d) {

                if (d.playtime > 0) {
                    return 7 + (Math.log(d.playtime));
                } else {
                    return 7;
                }

            })
            .style("stroke", '#fff')
            .style("stroke-width", "1,5px")
            .on("click", gameclick)
            .on('mouseover', function(d) { nodeHover(d,0) });

        //Append rect to user
        d3.selectAll('.user').append("rect")
            .attr('width', 50)
            .attr('height', 50)
            .style("fill", "rgb(78, 121, 167)")
            .style("stroke", '#fff')
            .style("stroke-width", "1,5px")
            .on('mouseover', function(d) { nodeHover(d,1); });
            //.on("click", userclick);

        //Append circle to category
        d3.selectAll('.category').append('polygon')
            .attr('points', '0,-25 -20,10 20,10')
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style('fill', 'black') // change this later so it depends on category
            .on('click', filtercategory)
            .on('mouseover', function(d) { nodeHover(d,0); });

        //If we want text, looks horrible 
        //nodeEnter.append("text")
        //  .attr("dy", ".35em")
        //  .text(function(d) { return d.name; });

        //manually create legends
        svg.append("rect")
            .attr("x",width-300)
            .attr("y",100)
            .attr("width",20)
            .attr("height",20)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill","rgb(78, 121, 167)")

        svg.append("text")
            .attr("x",width-270)
            .attr("y",110)
            .text("User")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle")

        svg.append("circle")
            .attr("cx",width-290)
            .attr("cy",140)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'rgb(78, 121, 167)')

        svg.append("text")
            .attr("x",width-270)
            .attr("y",140)
            .text("Owned Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle")

        svg.append('polygon')
            .attr('points', '990,160 980,180 1000,180')
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style('fill', 'black')

        svg.append("text")
            .attr("x",width-270)
            .attr("y",170)
            .text("Category")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle")

        svg.append("circle")
            .attr("cx",width-290)
            .attr("cy",200)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#ff0000')

        svg.append("text")
            .attr("x",width-270)
            .attr("y",200)
            .text("Strategy & Simulation Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle")

        svg.append("circle")
            .attr("cx",width-290)
            .attr("cy",230)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#80ff00')

        svg.append("text")
            .attr("x",width-270)
            .attr("y",230)
            .text("Shooter Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle")
        
        svg.append("circle")
            .attr("cx",width-290)
            .attr("cy",260)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#ff9500')

        svg.append("text")
            .attr("x",width-270)
            .attr("y",260)
            .text("RPG Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle")

        svg.append("circle")
            .attr("cx",width-290)
            .attr("cy",290)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#ff00ff')

        svg.append("text")
            .attr("x",width-270)
            .attr("y",290)
            .text("Puzzle & Arcade Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle")

        //saturation
        svg.append("circle")
            .attr("cx",width-290)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#ff0000')

        svg.append("circle")
            .attr("cx",width-260)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#e61919')

        svg.append("circle")
            .attr("cx",width-230)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#cc3333')

        svg.append("circle")
            .attr("cx",width-200)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#b34d4d')
        
        svg.append("circle")
            .attr("cx",width-170)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#996666')

        svg.append("text")
            .attr("x",width-300)
            .attr("y",350)
            .text("Saturation -> positive review ratio")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle")



    }

    function filtercategory(d) {

        if (d == currentfilter) {
            currentfilter = "";
            viz(steamtree[0]);
        } else {
            currentfilter = d;
            viz(d);
        }
    }
    //Tooltip 
    var tooltip = d3.select('#viz').append('div')
        .attr('id', 'tooltip')
        .attr('all', 'unset')
        .attr('style', 'position: absolute; opacity: 0;');

    d3.select('body').on('click', function(e) {
            d3.select('#tooltip').style('opacity', 0).style('display', 'none')
        })
        .on('mouseover', function(e) {
            d3.select('#tooltip_hover').style('opacity', 0).style('display', 'none');
        });

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
            
        svg.selectAll("g").attr("transform", function(d) { return "translate(" + 
                                                            Math.max(7, Math.min(width - 7, d.x)) + "," +
                                                            Math.max(7, Math.min(height - 7, d.y)) + ")"; });
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
        if( typeof rating == 'undefined' || rating < 0.0) {rating = 0.0}

        if (d.category == "Strategy & Simulation Games") {
            color = d3.hsl(0, Math.max(0.5,rating), 0.15 + 0.35 * rating)
        } else if (d.category == "Shooter Games") {
            color = d3.hsl(90, Math.max(0.5,rating), 0.15 + 0.35 * rating)
        } else if (d.category == "RPG Games") {
            color = d3.hsl(35, Math.max(0.5,rating), 0.15 + 0.35 * rating)
        } else if (d.category == "Puzzle & Arcade Games") {
            color = d3.hsl(300, Math.max(0.5,rating), 0.15 + 0.35 * rating)
        } else {
            color = "#000000"
        };


        return color

    }

    function nodeHover(d,toggle) {
        var txt;
        if(toggle) {
            txt = "That's you!"
        }else {
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

        d3.select(this)
            .style('stroke', 'black');

        if (d.header_img) {
            //This creates the buylink
            var buylink = "<input type=button class='buy_button' value=Buy name onclick=window.open('" + "https://store.steampowered.com/app/" + d.appid + "') />";

            function dropdown() {
                //This creates the dropdown menu for the tags 
                var tag;
                for (var i = 0; i < d.tags.length; i++) {
                    tag += '<option>' + d.tags[i] + '</option>'
                }
                return tag;
            }

            var tags = dropdown();
            if (d.playtime > -1) {
                //Goes here if the game is owned 
                d3.select('#tooltip')
                    .html("<img width=100% height=45% src=" + d.header_img + '>' +
                        "<p><b>" + d.name + "</b><br>" + "Category: " + d.category + "<br>" +
                        "Reviewscore: " + ((d.total_positive / (d.total_negative + d.total_positive)).toFixed(2) * 100) + "% Positive" +
                        "<br>" + "Price: " + d.price + "$" + "<br>" + "Playtime: " + d.playtime + " Minutes" + "<select id=selectNumber> <option>Tags</option>" + tags + "</select><br>" +
                        "<b>This game is owned by you.</b></p>")
                    .transition().duration(300)
                    .style('opacity', 1)
                    .style('display', 'block')
                    .style('left', this.getBoundingClientRect().x - 300 + 'px')
                    .style('top', this.getBoundingClientRect().y - 60 + 'px');
            } else {
                function dropdown() {
                    var tag;
                    for (var i = 0; i < d.tags.length; i++) {
                        tag += '<option>' + d.tags[i] + '</option>'
                    }
                    return tag;
                }
                var tags = dropdown();
                d3.select('#tooltip')
                    .html("<img width=100% height=45% src=" + d.header_img + '>' +
                        "<p><b>" + d.name + "</b><br>" + "Category: " + d.category + "<br>" +
                        "Reviewscore: " + ((d.total_positive / (d.total_negative + d.total_positive)).toFixed(2) * 100) + "% Positive" +
                        "<br>" + "Price: " + d.price + "$" + "<br>" +
                        "<select id=selectNumber> <option>Tags</option>" + tags + "</select>" + "<br>" + buylink +
                        "</p>")
                    .transition().duration(300)
                    .style('opacity', 1)
                    .style('display', 'block')
                    .style('left', this.getBoundingClientRect().x - 300 + 'px')
                    .style('top', this.getBoundingClientRect().y - 60 + 'px');
            }

        } else {
            d3.select('#tooltip')
                .html("No info")
                .transition().duration(300)
                .style('opacity', 1)
                .style('display', 'block')
                .style('left', this.getBoundingClientRect().x - 300 + 'px')
                .style('top', this.getBoundingClientRect().y - 60 + 'px');
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
    .text(('Max price: ' + price)); // default value

price_filter.append('input')
    .attr('type', 'range')
    .attr('min', 1)
    .attr('max', 100)
    .attr('value', price)
    .attr('step', 1)
    .attr('id', 'price_slider')
    .on('input', function() {
        price = +this.value;
        d3.select('#price_val').text(('Max price: ' + price));
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

    $('.filter').on('change', function() { addSelection(this.id, this.value) });
};

/*** FUNCTIONS ***/
/* Add attribute to selection list and as a list item on the page */
function addSelection(type, value) {
    if (value != -1) {
        if (!selection[type].includes(value)) { // check if item already in filter
            selection[type].push(value);
            selection_div.append('li')
                .attr('id', function() {
                    return value.toLowerCase().replace(/[^a-zA-Z+]+/gi, "");
                })
                .text('✕ ' + value)
                .on('click', function() { removeSelection(type, value) })
        }
        //console.log('updated selection: ', selection);
        updateVis();
    }
};

/* Remove attribute from selection list and its html element */
function removeSelection(type, value) {
    var index = (selection[type]).indexOf(value);
    if (index != -1) {
        (selection[type]).splice(index, 1);
    }
    var tmp = '#' + value.toLowerCase().replace(/[^a-zA-Z+]+/gi, "");
    // regex from stack overflow /^[^a-z]+|[^\w:.-]+/gi
    d3.select(tmp).remove();

    //console.log('updated selection: ', selection);
    updateVis();
};

/* Update attribute in selection */
function updateFilterSlider(type, value) {
    selection[type] = parseInt(value);
    updateVis();
};

$.ajaxSetup({
    contentType: "application/json; charset=utf-8"
});

function updateVis() {
    if ((selection.categories).length != 0) {
        sendRequestCat();
    } else {
        sendRequestNoCat();
    }
};

/* Send request with categories */
function sendRequestCat() {
    $.post("https://cryptic-river-41340.herokuapp.com/filter_games/76561197963264495?limit=300",
        JSON.stringify({
            "categories": selection.categories, // optional
            "max_price": selection.price, // optional, in dollars
            "tags": selection.tags, // optional, array of tags
            "min_positive_review_ratio": (selection.popularity / 100), // optional, maximum of ratio of positive review
            "developers": selection.developers, // optional
        }),
        //update steamtree
        function(data, status) {
            console.log('ok', data.games);
            steamtree = [];
            steamtree.push({ "name": "Steamuser", "children": data.games });
            steamtree = JSON.stringify(Object.assign({}, steamtree));
            steamtree = JSON.parse(steamtree);
            viz(steamtree[0]);
        });
};

function sendRequestNoCat() {
    $.post("https://cryptic-river-41340.herokuapp.com/filter_games/76561197963264495?limit=300",
        JSON.stringify({
            "max_price": selection.price, // optional, in dollars
            "tags": selection.tags, // optional, array of tags
            "min_positive_review_ratio": (selection.popularity / 100), // optional, maximum of ratio of positive review
            "developers": selection.developers, // optional
        }),
        //update steamtree
        function(data, status) {
            console.log('ok', data.games);
            steamtree = [];
            steamtree.push({ "name": "Steamuser", "children": data.games });
            steamtree = JSON.stringify(Object.assign({}, steamtree));
            steamtree = JSON.parse(steamtree);
            viz(steamtree[0]);
        });
}

$("#send_request").click(function() {
    if ((selection.categories).length != 0) {
        sendRequestCat();
    } else {
        sendRequestNoCat();
    }
});