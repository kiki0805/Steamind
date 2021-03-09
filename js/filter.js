import {get_data} from './get_data.js'

/*** VARIABLES ***/
var price = 100;
var price_filter = d3.select('#price_filter');

var pop = 1;
var pop_filter = d3.select('#pop_filter');

// Keeps track of current filters
var selection_div = d3.select("#selection");
var selection = {
    'tags':[],
    'categories':[],
    'developers':[], // don't seem to have a default
    'price':price,
    'popularity':pop
};

/*** SLIDER FILTERS ***/
// price filter
price_filter.append('span')
    .attr('id', 'price_val')
    .text(price);   // default value

price_filter.append('input')
    .attr('type', 'range')
    .attr('min', 1)
    .attr('max', 100)
    .attr('value', price)
    .attr('step', 1)
    .attr('id', 'price_slider')
    .on('input', function() {
        price = +this.value;
        d3.select('#price_val').text(price);
    })
    .on('change', function() { updateFilterSlider('price', this.value) });

// popularity filter
pop_filter.append('span')
    .attr('id', 'pop_val')
    .text(pop);   // default value

pop_filter.append('input')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', 1)
    .attr('value', pop)
    .attr('step', 0.1)
    .attr('id', 'pop_slider')
    .on('input', function() {
        pop = +this.value;
        d3.select('#pop_val').text(pop);
    })
    .on('change', function() { updateFilterSlider('popularity', this.value) });

/*** DROP-DOWN FILTERS ***/
/* Filter options */
var vis, resetVis;
var tagL, devL;
d3.json('backend/steam_scrapy/mock_data.json') // replace this with actual fetched data
    .then(function(data) {
        devL = data.developers;
        tagL = data.tags;
        vis = resetVis = data.games;
        create_filter_options();
});

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
}

/*** FUNCTIONS ***/
/* Add attribute to selection list and as a list item on the page */
function addSelection(type, value) {
    if(value != -1) {
        if(!selection[type].includes(value)) { // check if item already in filter
            selection[type].push(value);
            selection_div.append('li')
                .attr('id', function() {
                    return value.toLowerCase().replace(/^[^a-z]+|[^\w:.-]+/gi, "");
                })
                .text('✕ '+value)
                .on('click', function() { removeSelection(type, value) })
        }
        updateVis();
    }
    console.log(selection)
}

/* Remove attribute from selection list and its html element */
function removeSelection(type, value) {
    var index = (selection[type]).indexOf(value);
    if(index != -1) {
        (selection[type]).splice(index, 1);
    }
    var tmp = '#'+value.toLowerCase().replace(/^[^a-z]+|[^\w:.-]+/gi, "");
    d3.select(tmp).remove();
    
    updateVis();
    console.log(selection)
}

/* Update attribute in selection */
function updateFilterSlider(type, value) {
    selection[type] = parseInt(value);
    updateVis();
}

$.ajaxSetup({
    contentType: "application/json; charset=utf-8"
  });

function updateVis() {
    $.post("http://3.129.66.238:8000/filter_games/76561197963264495?limit=300", 
    JSON.stringify({
        "categories": selection.categories, // optional
        "max_price": selection.price, // optional, in dollars
        "tags": selection.tags, // optional, array of tags
        "max_positive_review_ratio": selection.popularity, // optional, maximum of ratio of positive review
        "developers": selection.developers, // optional
    }),
    function(data, status){
      console.log(data.games);
    });
}

$("#send_request").click(function(){
    console.log('sending!');
    $.post("http://3.129.66.238:8000/filter_games/76561197963264495?limit=300", 
    JSON.stringify({
        "categories": selection.categories, // optional
        "max_price": selection.price, // optional, in dollars
        "tags": selection.tags, // optional, array of tags
        "max_positive_review_ratio": selection.popularity, // optional, maximum of ratio of positive review
        "developers": selection.developers, // optional
    }),
    function(data, status){
      console.log('ok', data);
    });
});

/*
$("#send_request2").click(function(){
    $.post("http://3.129.66.238:8000/filter_games", 
    JSON.stringify({
        "category": "Shooter Games", // optional
        "max_price": 100, // optional, in dollars
        "tags": ["Shooter"], // optional, array of tags
        "max_positive_review_ratio": 1, // optional, maximum of ratio of positive review
        "developer": "Valve", // optional
    }),
    function(data, status){
      console.log('ok', data)
    });
});
*/
/*
function addToFilter(type, value) {
console.log('hej');

if(selection.includes( $(this).val() )) {   // check if item already in filter
    // do nothing
}else {
    console.log
    //selection.tags.push( $(this).val() );
    selection_div.append('li')              // add to list of filtered items
    .attr('id', () => {
        var val = $(this).val();
        val.toLowerCase().replace(/^[^a-z]+|[^\w:.-]+/gi, "");
    })
    .attr('class', 'a')
    .text( '✕ '+$(this).val() )
    //.on('click', () => { removeFromFilter($(this)) });
}
$('.a').click(removeFromFilter);

}

function removeFromFilter() {
    var index = selection.tags.indexOf( $(this).text() );
    if(index != -1) {
        selection.tags.splice(index, 1);
    }
    $(this).remove();
}
*/