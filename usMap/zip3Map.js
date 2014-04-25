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

var colorScale = d3.scale.linear()
    .domain([0, 100])
    .range(["blue", "red"]);


var allZips, zipCount;
function easeBigBounce(t){
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var quarterTpi = (t-0.25)*Math.PI;
    return 5 * (Math.sin(4*quarterTpi)/quarterTpi);
}

function nextZip(){
    var index = Math.floor(Math.random() * allZips.length);
    return allZips[index];
}

function startRandom(){
    setInterval(function(){
	var s = nextZip();
	var count = zipCount[s];
	count += 1;
	zipCount[s] = count;
	d3.select("#zip-" + s)
	   .transition()
	   .duration(800)
	   .ease(easeBigBounce)
	   .style("fill", colorScale(count));
    }, 50);
}

function updateInfo(d){
    infoDiv = d3.select("#info");
    infoDiv.html("<h3>" + d.properties.zip3 + '</h3><div class="dataBlock"><span class="name">Count:</span><span class="data">' + zipCount[d.properties.zip3] + '</span></div>')
}

function mouseMove(){
    d3.select('#infoCtr')
	.transition()
	.duration(100)
	.style("left", (d3.event.pageX) + "px")
	.style("top", (d3.event.pageY + 50) + "px")
    var zip = d3.event.toElement && d3.select(d3.event.toElement).classed("zip") ? d3.event.toElement : null;
    var info = d3.select("#info");
    if (zip){
	var d3Zip = d3.select(zip);
	updateInfo(d3Zip.datum())
	info.transition()
	    .duration(300)
	    .style("opacity", 0.9);
    } else {
	info.transition()
	    .duration(300)
	    .style("opacity", 0);
    }

}


function loadZips(error, us){
    var zips = topojson.feature(us, us.objects.zip3);
    allZips = zips.features.map(function(d){return d.properties.zip3;});
    zipCount = allZips.reduce(function(m, z){m[z] = 0; return m;}, {});

    svg.on("mousemove", mouseMove);

    svg.selectAll("path")
     .data(zips.features)
     .enter().append("path")
       .attr("class", "zip")
       .attr("d", path)
       .attr("id", function(d) {return "zip-" + d.properties.zip3;});

    svg.insert("path", ".graticule")
       .datum(topojson.mesh(us, us.objects.zip3, function(a, b) {return a !== b; }))
       .attr("class", "zip-boundry")
       .attr("d", path);

};

queue()
   .defer(d3.json, "zip3-simp.json")
   .await(function(){loadZips.apply(null, arguments); startRandom()});


//d3.select(self.frameElement).style("height", height + "px");