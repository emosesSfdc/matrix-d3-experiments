var width = 960;
var height = 700;

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width/2, height/2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

var zoom = d3.behavior.zoom()
    .translate([0,0])
    .scale(1)
    .scaleExtent([1,16])
    .on("zoom", zoomed);

svg.call(zoom).call(zoom.event);

var colorScale = d3.scale.linear()
    .domain([0, 100])
    .range(["blue", "red"]);


var allRegions;
function easeBigBounce(t){
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var quarterTpi = (t-0.25)*Math.PI;
    return 5 * (Math.sin(4*quarterTpi)/quarterTpi);
}

function nextRegion(){
    var index = Math.floor(Math.random() * allRegions.length);
    return allRegions[index];
}

function startRandom(){
    setInterval(function(){
	var s = nextRegion();
	var region = d3.select("#region-" + s);

	var datum = region.datum();
	datum.properties.count += 1;
	region.datum(datum);

	updateRegion(region, "count");
    }, 50);
}

function updateRegion(region, property){
    region.select("path")
       .transition()
       .duration(800)
       .ease(easeBigBounce)
       .style("fill", function(d){return colorScale(d.properties[property]);});

    region.select("text").text(regionText);
}

function updateInfo(d){
    infoDiv = d3.select("#info");
    infoDiv.html("<h3>" + d.properties.zip3 + '</h3><div class="dataBlock"><span class="name">Count:</span><span class="data">' + d.properties.count + '</span></div>')
}

function findParentWithClass(node, className){
   var parent = node;
   while (parent && parent != document.body){
       if (d3.select(parent).classed(className)){
	   return parent;
       }
       parent = parent.parentNode;
   }
   return false; 
};

function mouseMove(){
    d3.select('#infoCtr')
	.transition()
	.duration(100)
	.style("left", (d3.event.pageX) + "px")
	.style("top", (d3.event.pageY + 50) + "px")
    var region = findParentWithClass(d3.event.toElement, "regionG");
    var info = d3.select("#info");
    if (region){
	var d3Region = d3.select(region);
	updateInfo(d3Region.datum())
	info.transition()
	    .duration(300)
	    .style("opacity", 0.9);
    } else {
	info.transition()
	    .duration(300)
	    .style("opacity", 0);
    }

}

function regionText(d){
    return d.properties.zip3 + ": " + d.properties.count; 
}


function loadRegions(error, us){
    var regions = topojson.feature(us, us.objects.zip3);
    //Add in count to each region
    regions.features.forEach(function(d) {d.properties.count = 0;});
    allRegions = regions.features.map(function(d){return d.properties.zip3;});
    /*
    regionCount = allRegions.reduce(function(m, z){m[z] = 0; return m;}, {});
    */

    g.on("mousemove", mouseMove);

    var regions = g.selectAll("path")
     .data(regions.features)
     .enter().append("g")
       .attr("class", "regionG")
       .attr("id", function(d) {return "region-" + d.properties.zip3;});

    regions.append("path")
       .attr("class", "region")
       .attr("d", path);

    regions.append("text")
       .text(regionText)
       .attr("x", function(d){ return path.centroid(d)[0];})
       .attr("y", function(d){ return path.centroid(d)[1];})
       .style("font-size", function(d) {var bounds = path.bounds(d);
					var width = bounds[1][0] - bounds[0][0];
					return (width / 6.0) + "px" })
       .attr("text-anchor", "middle")
       .attr("dy", ".35em");

    g.insert("path", ".graticule")
       .datum(topojson.mesh(us, us.objects.zip3, function(a, b) {return a !== b; }))
       .attr("class", "region-boundry")
       .attr("d", path);
};

function zoomed(){
    g.style("stroke-width", 1.5 / d3.event.scale + "px");
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function initPage(){
    d3.select("#randomStart")
       .property("disabled", true);
}

function loadDone(){
    d3.select("#randomStart")
       .property("disabled", false)
       .on("click", function(){ startRandom();});
}
	   

queue()
   .defer(d3.json, "zip3-simp.json")
   .await(function(){loadRegions.apply(null, arguments); loadDone()});

var socket = io.connect("http://devstack.sfdc-matrix.net:3020/viewOutput");
socket.on('topicMessage', function(data){
    console.log(evt);
});



//d3.select(self.frameElement).style("height", height + "px");
