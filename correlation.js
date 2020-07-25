var sizeWhole = 400;

// Create the svg area
var svg = d3.select("#correlation-graph")
    .append("svg")
    .attr("width", sizeWhole)
    .attr("height", sizeWhole)
    .append("g");

function clickPoint(n){
    console.log("HERE");
}

d3.csv("http://localhost:8080/happiness.csv", function(data) {
    mar = 20; // Margin
    size = sizeWhole;
    
    // Get current variable name
    var var1 = "Score";
    var var2 = "GDP per capita";

    // Add X Scale of each graph
    xextent = d3.extent(data, function(d) { return +d[var1] })
    var x = d3.scaleLinear()
        .domain(xextent).nice()
        .range([ 0, size-2*mar ]);

    // Add Y Scale of each graph
    yextent = d3.extent(data, function(d) { return +d[var2] })
    var y = d3.scaleLinear()
        .domain(yextent).nice()
        .range([ size-2*mar, 0 ]);

    // Add a 'g' at the right position
    var tmp = svg
        .append('g')
        .attr("transform", "translate(30, 0)");
        

    // Add X and Y axis in tmp
    tmp.append("g")
        .attr("transform", "translate(" + 0 + "," + (size-mar*2) + ")")
        .call(d3.axisBottom(x).ticks(3));
    tmp.append("g")
        .call(d3.axisLeft(y).ticks(3));

    // Add circle
    tmp.selectAll("myCircles")
        .data(data)
        .enter()
        .append("circle")
            
            .attr("cx", function(d){ return x(+d[var1]) })
            .attr("cy", function(d){ return y(+d[var2]) })
            .attr("r", 3)
            .attr("fill", 'rgb(197, 37, 63)')
            .on("mouseover", function(d){
                document.getElementById('current-point').style.display = 'block';
                document.getElementById('current-point').innerHTML = 'Country: ' + d['name'] + '(' + d['Overall rank'] +')';
            })
            .on("mouseleave", function(d){
                document.getElementById('current-point').innerHTML = 'Country: N/A';
            });
})