var width = 960,
    height = 500,
    active = d3.select(null);

var projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

var zoom = d3.zoom().on("zoom", zoomed);
var path = d3.geoPath().projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

// Add "map-container" class to the SVG
svg.attr("class", "map-container");

var scatter_plot = document.getElementById('scatter-plot')
    //document.getElementById('correlation-graph').appendChild(document.getElementById('scatter-plot'));

// SVG Rectangle: Change attributes
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

// New G in SVG
var g = svg.append("g");

// Allow Free Zooming
svg.call(zoom); // delete this line to disable free zooming

// Data
var data = d3.map();

// Color Scale
var colorScale = d3.scaleThreshold()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
    .range(d3.schemePurples[9]);

// Load external data and boot
var countries = [];
var average_score, max_score, min_score = null;
var average_GDP, max_GDP, min_GDP = null;
var average_freedom, max_freedom, min_freedom = null;
var average_social_support, max_social_support, min_social_support = null;

var colorNumber = 0;
for (var color of d3.schemePurples[9]) {
    // Label
    var numberLabel = document.createElement('span');
    numberLabel.className = 'legend-label';
    numberLabel.innerHTML = (colorNumber++) - 1;
    if (numberLabel.innerHTML == '-1') {
        numberLabel.innerHTML = 'N/A';
    }

    // New Div
    var newDiv = document.createElement('div');
    newDiv.className = 'legend-block';
    newDiv.style.backgroundColor = color;
    newDiv.appendChild(numberLabel);

    // Append Div
    document.getElementById('color-legend').appendChild(newDiv);
}

function setStatistics() {
    // Score
    var scores = countries.map(c => parseFloat(c.score));
    average_score = scores.reduce(function(a, b) {
        return a + b;
    }, 0) / scores.length;
    max_score = Math.max.apply(null, scores);
    min_score = Math.min.apply(null, scores);

    // GDP
    var GDPs = countries.map(c => parseFloat(c.GDP));
    average_GDP = GDPs.reduce(function(a, b) {
        return a + b;
    }, 0) / GDPs.length;
    max_GDP = Math.max.apply(null, GDPs);
    min_GDP = Math.min.apply(null, GDPs);

    // Social Support
    var social_supports = countries.map(c => parseFloat(c.social_support));
    average_social_support = social_supports.reduce(function(a, b) {
        return a + b;
    }, 0) / social_supports.length;
    max_social_support = Math.max.apply(null, social_supports);
    min_social_support = Math.min.apply(null, social_supports);

    // Freedom
    var freedoms = countries.map(c => parseFloat(c.freedom));
    average_freedom = freedoms.reduce(function(a, b) {
        return a + b;
    }, 0) / freedoms.length;
    max_freedom = Math.max.apply(null, freedoms);
    min_freedom = Math.min.apply(null, freedoms);

    // Set HTML: Score
    for (var elem of document.getElementsByClassName('min-score')) {
        elem.style.left = parseFloat(100 * min_score / max_score) + '%';
    }
    for (var elem of document.getElementsByClassName('avg-score')) {
        elem.style.left = parseFloat(100 * average_score / max_score) + '%';
    }

    // Set HTML: GDP
    document.getElementById('min-gdp').style.left = parseFloat(100 * min_GDP / max_GDP) + '%';
    for (var elem of document.getElementsByClassName('avg-gdp')) {
        elem.style.left = parseFloat(100 * average_GDP / max_GDP) + '%';
    }

    // Set HTML: Social Support
    document.getElementById('min-soc-support').style.left = parseFloat(100 * min_social_support / max_social_support) + '%';
    for (var elem of document.getElementsByClassName('avg-soc-support')) {
        elem.style.left = parseFloat(100 * average_social_support / max_social_support) + '%';
    }

    // Set HTML: Freedom
    for (var elem of document.getElementsByClassName('min-freedom')) {
        elem.style.left = parseFloat(100 * min_freedom / max_freedom) + '%';
    }
    for (var elem of document.getElementsByClassName('avg-freedom')) {
        elem.style.left = parseFloat(100 * average_freedom / max_freedom) + '%';
    }
}

function loadFunction(d) {
    var country_data = {
        name: d.name,
        score: d.Score,
        position: d["Overall rank"],
        GDP: d['GDP per capita'],
        social_support: d['Social support'],
        freedom: d['Freedom to make life choices']
    };
    data.set(d.code, country_data);
    countries.push(country_data);
    setStatistics();
};

d3.queue().defer(d3.csv, "http://localhost:8080/happiness.csv", loadFunction);

function mouseOver(d) {
    d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .5)
        .style("stroke", "transparent")
        .style("stroke-width", "1")

    d3.select(this)
        .transition()
        .duration(100)
        .style("opacity", 1)
        .style("stroke", "rgb(90, 230, 172)")
        .style("stroke-width", "2")
        .transition()
        .duration(300)
        .style("stroke", "transparent")
        .style("stroke-width", "1")
}

function mouseLeave(d) {
    d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8)
        /*
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent")

        */
}

d3.json("http://localhost:8080/world.geojson", function(error, world) {
    if (error) throw error;

    g.selectAll("path")
        .data(world.features)
        .enter().append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function(d) {
            var country_data = data.get(d.id);
            if (country_data == undefined) {
                d.total = 0;
            } else {
                d.total = country_data.score
            }
            return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d) { return "Country" })
        .style("opacity", .8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("click", clicked);

    g.append("path")
        .datum(topojson.mesh(world, world.features, function(a, b) { return a !== b; }))
        .attr("class", "mesh")
        .attr("d", path);


    // Set Data
    var country_data = data.get('FIN');
    document.getElementById('fin-country-name').innerHTML = country_data.name;
    document.getElementById('fin-country-score').innerHTML = country_data.score;
    document.getElementById('fin-country-gdp').innerHTML = country_data.GDP;
    document.getElementById('fin-country-soc-support').innerHTML = country_data.social_support;
    document.getElementById('fin-country-freedom').innerHTML = country_data.freedom;
    document.getElementById('fin-position-number').innerHTML = country_data.position;

    // Set Metric Bars
    document.getElementById('fin-score-bar').style.width = parseFloat(100 * country_data.score / max_score) + '%';
    document.getElementById('fin-gdp-bar').style.width = parseFloat(100 * country_data.GDP / max_GDP) + '%';
    document.getElementById('fin-soc-support-bar').style.width = parseFloat(100 * country_data.social_support / max_social_support) + '%';
    document.getElementById('fin-freedom-bar').style.width = parseFloat(100 * country_data.freedom / max_freedom) + '%';

});

function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);
    d3.select(this)
        .style("stroke", "rgb(90, 127, 230)")
        .style("stroke-width", "2")
        .transition()
        .duration(550)
        .style("stroke", "transparent")
        .style("stroke-width", "1")


    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
        .duration(750)
        // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)); // updated for d3 v4

    // Show Data
    setData(active._groups[0][0].__data__);
}

function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .duration(750)
        // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
        .call(zoom.transform, d3.zoomIdentity); // updated for d3 v4

    // Set Data
    setData(null);
}

function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    g.attr("transform", d3.event.transform);
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

// Show Data
function setData(country) {
    if (country == null || data.get(country.id) == null) {
        document.getElementById('info-panel').style.display = 'none';
        document.getElementById('correlation-graph').style.display = 'flex';
    } else {
        document.getElementById('info-panel').style.display = 'flex';
        document.getElementById('correlation-graph').style.display = 'none';
        var country_data = data.get(country.id);
        document.getElementById('country-name').innerHTML = country_data.name;
        document.getElementById('country-score').innerHTML = country_data.score;
        document.getElementById('country-gdp').innerHTML = country_data.GDP;
        document.getElementById('country-soc-support').innerHTML = country_data.social_support;
        document.getElementById('country-freedom').innerHTML = country_data.freedom;
        document.getElementById('position-number').innerHTML = country_data.position;

        // Set Metric Bars
        document.getElementById('score-bar').style.width = parseFloat(100 * country_data.score / max_score) + '%';
        document.getElementById('gdp-bar').style.width = parseFloat(100 * country_data.GDP / max_GDP) + '%';
        document.getElementById('soc-support-bar').style.width = parseFloat(100 * country_data.social_support / max_social_support) + '%';
        document.getElementById('freedom-bar').style.width = parseFloat(100 * country_data.freedom / max_freedom) + '%';
    }
}