export function create_legend() {
        var svgParent = d3.select("#legend");

        var width = document.getElementById("legend").getBoundingClientRect().width;
        var height = document.getElementById("legend").getBoundingClientRect().height;

        var svg = svgParent.append("svg")
        .attr("id", "svgLegend")
        .attr("width", width)
        .attr("height", height);

        //manually create legend
        svg.append("text")
            .attr("x",width-260)
            .attr("y",70)
            .text("Legend")
            .style("font-size","17px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        // user
        svg.append("rect")
            .attr("x",width-255)
            .attr("y",100)
            .attr("width",20)
            .attr("height",20)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill","rgb(78, 121, 167)");

        svg.append("text")
            .attr("x",width-230)
            .attr("y",115)
            .text("User")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        // owned games
        svg.append("circle")
            .attr("cx",width-245)
            .attr("cy",140)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'rgb(78, 121, 167)');

        svg.append("text")
            .attr("x",width-230)
            .attr("y",145)
            .text("Owned Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        // category
        svg.append('polygon')
            .attr('points', `17, 160, 7,180, 27, 180`)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style('fill', 'black');

        svg.append("text")
            .attr("x",width-230)
            .attr("y",175)
            .text("Category")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        // strategy sim games
        svg.append("circle")
            .attr("cx",width-245)
            .attr("cy",200)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#ff0000')
            .attr("class", "legend-filter")
            .attr("value", "Strategy & Simulation Games")
            .attr('cursor', 'pointer');

        svg.append("text")
            .attr("x",width-230)
            .attr("y",205)
            .text("Strategy & Simulation Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        // shooter games
        svg.append("circle")
            .attr("cx",width-245)
            .attr("cy",230)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#80ff00')
            .attr("class", "legend-filter")
            .attr("value", "Shooter Games")
            .attr('cursor', 'pointer');

        svg.append("text")
            .attr("x",width-230)
            .attr("y",235)
            .text("Shooter Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");
        
        // RPG games
        svg.append("circle")
            .attr("cx",width-245)
            .attr("cy",260)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#ff9500')
            .attr("class", "legend-filter")
            .attr("value", "RPG Games")
            .attr('cursor', 'pointer');

        svg.append("text")
            .attr("x",width-230)
            .attr("y",265)
            .text("RPG Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        // puzzle arcade games
        svg.append("circle")
            .attr("cx",width-245)
            .attr("cy",290)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#ff00ff')
            .attr("class", "legend-filter")
            .attr("value", "Puzzle & Arcade Games")
            .attr('cursor', 'pointer');

        svg.append("text")
            .attr("x",width-230)
            .attr("y",295)
            .text("Puzzle & Arcade Games")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        //saturation
        svg.append("circle")
            .attr("cx",width-245)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#ff0000');

        svg.append("circle")
            .attr("cx",width-215)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#c51f16');

        svg.append("circle")
            .attr("cx",width-185)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#932a25');

        svg.append("circle")
            .attr("cx",width-155)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#682f2c');
        
        svg.append("circle")
            .attr("cx",width-125)
            .attr("cy",320)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'#492927');

        svg.append("text")
            .attr("x",width-260)
            .attr("y",350)
            .text("Review ratio (darker = less popular)")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        // size
        svg.append("circle")
            .attr("cx",width-155)
            .attr("cy",380)
            .attr("r", 5)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'rgb(78, 121, 167)');
        
        svg.append("circle")
            .attr("cx",width-195)
            .attr("cy",380)
            .attr("r", 10)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'rgb(78, 121, 167)');

        svg.append("circle")
            .attr("cx",width-235)
            .attr("cy",380)
            .attr("r", 15)
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .style("fill",'rgb(78, 121, 167)');

        svg.append("text")
            .attr("x",width-260)
            .attr("y",420)
            .text("Playtime (Larger = more playtime)")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");

        // black border
        svg.append("circle")
            .attr("cx",width-235)
            .attr("cy",440)
            .attr("r", 8)
            .style('stroke', '#000')
            .style('stroke-width', '1.5px')
            .style("fill",'rgb(78, 121, 167)');

        svg.append("text")
            .attr("x",width-260)
            .attr("y",465)
            .text("Black Border = Visited Game")
            .style("font-size","15px")
            .style("fill","white")
            .attr("alignment-baseline","middle");
    }