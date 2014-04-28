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
    .scaleExtent([1,8])
    .on("zoom", zoomed);

svg.call(zoom).call(zoom.event);

var colorScale = d3.scale.linear()
    .domain([0, 100])
    .range(["blue", "red"]);


var allZips;
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
	var zip = d3.select("#zip-" + s);
	var datum = zip.datum();
	datum.properties.count += 1;

	zip.datum(datum)
	   .transition()
	   .duration(800)
	   .ease(easeBigBounce)
	   .style("fill", function(d){return colorScale(d.properties.count);});
    }, 50);
}

function updateInfo(d){
    infoDiv = d3.select("#info");
    infoDiv.html("<h3>" + d.properties.zip3 + '</h3><div class="dataBlock"><span class="name">Count:</span><span class="data">' + d.properties.count + '</span></div>')
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
    //Add in count to each zip
    zips.features.forEach(function(d) {d.properties.count = 0;});
    allZips = zips.features.map(function(d){return d.properties.zip3;});
    /*
    zipCount = allZips.reduce(function(m, z){m[z] = 0; return m;}, {});
    */

    g.on("mousemove", mouseMove);

    g.selectAll("path")
     .data(zips.features)
     .enter().append("path")
       .attr("class", "zip")
       .attr("d", path)
       .attr("id", function(d) {return "zip-" + d.properties.zip3;});

    g.insert("path", ".graticule")
       .datum(topojson.mesh(us, us.objects.zip3, function(a, b) {return a !== b; }))
       .attr("class", "zip-boundry")
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
   .await(function(){loadZips.apply(null, arguments); loadDone()});

var socket = io.connect("http://devstack.sfdc-matrix.net:3020/viewOutput");
socket.on('topicMessage', function(data){
    console.log(evt);
});



//d3.select(self.frameElement).style("height", height + "px");
