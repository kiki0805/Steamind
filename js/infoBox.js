//console.log("test");
var tooltip2 = d3.select('#info')
                .append("div")
                .style("position","absolute")
                .style("visibility","hiden")
                .style("background-color","white")
                .style("border","solid")
                .style("boder-width","1px")
                .style("border-radius","5px")
                .style("padding","10px")
                .html("<p>content</p>")

console.log("test")

d3.select("#info")
    .on("click",function(){return tooltip2.style("visibility","visible");})
    .on("mouseout",function(){return tooltip2.style("visibility","hiden")})
