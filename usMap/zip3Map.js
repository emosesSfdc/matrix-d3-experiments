//Dimensions of the rendered chart.
var width = 960;
var height = 700;

//This is the geographic projection we're using to render the geo data
//to the screen.  AlbersUsa puts AK and HI in the lower left
var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width/2, height/2]);

var path = d3.geo.path()
    .projection(projection);

//Create the SVG
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//Create a grouping at the top level.  We use this to pan and zoom
var g = svg.append("g");

//Create the zoom behavior.  look at the zoomed() function to see what's acutally going on
var zoom = d3.behavior.zoom()
    .translate([0,0])
    .scale(1)
    .scaleExtent([1,16])
    .on("zoom", zoomed);

svg.call(zoom).call(zoom.event);

//This is the color scale we're using to color the map.  It maps 1-100 to blue-red on a log scale
//Note that log is undefined at 0, so we have to start at 1.  Linear scales don't have that restriction
var colorScale = d3.scale.log()
    .domain([1, 100])
    .range(["blue", "red"]);

//How often we call the decay function to decrease the heat of a region (in ms)
var DECAY_INTERVAL = 100;
//How much the heat of a region jumps each time there's a hit.  This is in the domain
//of colorScale
var HEAT_JUMP = 20;
//How much the heat of a region decreases each time decay is called
var HEAT_DECAY = 1;
//The smallest font size we'll render at a given zoom level (in px)
var MIN_FONT_SIZE = 6;

//This will be an array of the names of all the regions that the random data generator will index into.
var allRegions;
/**
 * An easing function that bounces way above the final value at the beginning, and then tails off to near
 * final value.  Needs a little tuning, really
 */
function easeBigBounce(t){
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var quarterTpi = (t-0.25)*Math.PI;
    return 5 * (Math.sin(4*quarterTpi)/quarterTpi);
}

/**
 * Pick a region at random out of allRegions
 */
function nextRegion(){
    var index = Math.floor(Math.random() * allRegions.length);
    return allRegions[index];
}

/**
 * Given a region name, increase its heat by HEAT_JUMP, update its count
 * (if given), and render the change
 */
function hitRegion(regionName, /*optional*/count){
    var region = d3.select("#region-" + regionName);

    var datum = region.datum();
    if (typeof(count) != "number"){
	count = datum.properties.count +1;
    }
    datum.properties.count = count;
    datum.properties.heat += HEAT_JUMP;
    region.datum(datum);

    updateRegion(region, "heat");
}

/**
 * Begin generating random data, updating every 50ms
 */
function startRandom(){
    setInterval(function(){
	var s = nextRegion();
	hitRegion(s);
    }, 50);
}

/**
 * This will be called by a timer to lower the heat of all regions by HEAT_DECAY
 * every DECAY_INTEVAL ms.
 */
function decayAndUpdate(){
    d3.selectAll(".regionG path")
      .each(function(d){
	  if (d.properties.heat > 1){
	      //Can't decrease heat past 1 because of the log scale.
	      //TODO: Refer to the scale here.
	      d.properties.heat = Math.max(d.properties.heat - HEAT_DECAY, 1);
	      //Update the region by its heat.
	      d3.select(this)
		  .transition()
	          .duration(DECAY_INTERVAL - 10)
		  .style("fill", colorScale(d.properties.heat));
	  }
	});
}

//Update the fill of a region by its heat property
function updateRegion(region){
    region.select("path")
	.transition()
        .duration(400)
        .style("fill", function(d){ return colorScale(d.properties.heat);});

    //Update region's text field using the text function
    region.select("text").text(regionText);
}

/**
 * Update the singleton Info block, given a datum
 */
function updateInfo(d){
    infoDiv = d3.select("#info");
    infoDiv.html("<h3>" + d.properties.zip3 + '</h3><div class="dataBlock"><span class="name">Count:</span><span class="data">' + d.properties.count + '</span></div>')
}

/**
 * A standard-ish DOM function.  Given a node, find a node in
 * that node's parent tree with the specified class.  If node
 * has that class, return node.  If nothing in its hierarchy does,
 * return null;
 */
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

/**
 * As the user moves their mouse over the map, if it's over a
 * region, make sure the info block is faded in, update it, and
 * move it to where the mouse is.  If it's not over a region, fade it out.
 */
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

/**
 * Given a datum, return what the text in the region should be.
 */
function regionText(d){
    return d.properties.count; 
}


/**
 * Load the regions from the geodata json, render them, and initialize all the
 * data an event handlers.
 */
function loadRegions(error, us){
    var regions = topojson.feature(us, us.objects.zip3);
    //Add in count and heat to each region
    regions.features.forEach(function(d) {d.properties.count = 0; d.properties.heat = 0;});
    //Initilize the allRegions global
    allRegions = regions.features.map(function(d){return d.properties.zip3;});

    //Attach the mousemove handler
    d3.select(document.body).on("mousemove", mouseMove);

    //Create a g for each region that will contain the path and the text
    var regions = g.selectAll("g")
     .data(regions.features)
     .enter().append("g")
       .attr("class", "regionG")
       .attr("id", function(d) {return "region-" + d.properties.zip3;});

    regions.append("path")
       .attr("class", "region")
       .attr("d", path);

    //Create the text for each region, move it to the centroid of the path, and calculate the proper size
    //from the region's bounding box.
    regions.append("text")
       .text(regionText)
       .attr("x", function(d){ return path.centroid(d)[0];})
       .attr("y", function(d){ return path.centroid(d)[1];})
       .style("font-size", function(d) {var bounds = path.bounds(d);
					var width = bounds[1][0] - bounds[0][0];
					return (width / 6.0) + "px" })
       .attr("text-anchor", "middle")
       .attr("dy", ".35em")
       .each(function(){hideTextIfTooSmall.call(this, 1)});

    //This calculates mesh of all the region borders and renders it.
    g.insert("path", ".graticule")
       .datum(topojson.mesh(us, us.objects.zip3, function(a, b) {return a !== b; }))
       .attr("class", "region-boundry")
       .attr("d", path);
};

//For use with in an each with all text nodes
function hideTextIfTooSmall(scale){
    var text = d3.select(this);
    if (parseInt(window.getComputedStyle(this).fontSize) * scale < MIN_FONT_SIZE){
	text.style("visibility", "hidden");
    } else {
	text.style("visibility", "visible");
    }
}

//Together with d3's zoom event handlers, handle mouse pan & zoom
function zoomed(){
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    g.selectAll("text").each(function() {hideTextIfTooSmall.call(this, d3.event.scale);});
}

//Run at the beginning of the load, disable the button until the data is loaded.
function initPage(){
    d3.select("#randomStart")
       .property("disabled", true);
}

//Called after load is done.  
function loadDone(){
    //Make the random data button available.
    d3.select("#randomStart")
       .property("disabled", false)
       .on("click", function(){ startRandom();});

    //Start the heat decay function
    setInterval(decayAndUpdate, DECAY_INTERVAL);
    //Connect to the websocket for server-based data
    connectToServer();
}
	   
/**
 * Connect to a websocket to get server based data.  Currently
 * hardcoded to port 9002 on the same host as this page, and expecting
 * JSON data in the format {"zip3": <region name>, "count": <count data for region>}
 * Count will be displayed on the region's text
 */
function connectToServer(){
    var hostString = window.location.protocol + "//" + window.location.hostname + ":9002";
    var socket = io.connect(hostString);
    socket.on('topicMessage', function(data){
	hitRegion(data.zip3, data.count);
	
    });
}

//Load up the geo data and call the loading functions when done
queue()
   .defer(d3.json, "zip3-simp.json")
   .await(function(){loadRegions.apply(null, arguments); loadDone()});




