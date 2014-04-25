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

colorScale = d3.scale.linear()
    .domain([0, 100])
    .range(["blue", "red"]);

var states =["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

var stateCount = states.reduce(function(m, val){m[val] = 0; return m;}, {});

function easeBigBounce(t){
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var quarterTpi = (t-0.25)*Math.PI;
    return 3 * (Math.sin(4*quarterTpi)/quarterTpi);
}

function nextState(){
    var index = Math.floor(Math.random() * states.length);
    return states[index];
}

function startRandom(){
    setInterval(function(){
	var s = nextState();
	var count = stateCount[s];
	count += 1;
	stateCount[s] = count;
	d3.select("#state-" + s)
	   .transition()
	   .duration(200)
	   .ease(easeBigBounce)
	   .style("fill", colorScale(count));
    }, 50);
}

function updateInfo(d){
    infoDiv = d3.select("#info");
    infoDiv.html("<h3>" + d.properties.name + '</h3><div class="dataBlock"><span class="name">Count:</span><span class="data">' + stateCount[d.properties.code] + '</span></div>')
}

function mouseMove(){
    d3.select('#infoCtr')
	.transition()
	.duration(100)
	.style("left", (d3.event.pageX) + "px")
	.style("top", (d3.event.pageY + 50) + "px")
    var state = d3.event.toElement && d3.select(d3.event.toElement).classed("state") ? d3.event.toElement : null;
    var info = d3.select("#info");
    if (state){
	var d3State = d3.select(state);
	updateInfo(d3State.datum())
	info.transition()
	    .duration(300)
	    .style("opacity", 0.9);
    } else {
	info.transition()
	    .duration(300)
	    .style("opacity", 0);
    }

}

function loadStates(error, us){
    var states = topojson.feature(us, us.objects.states);

    svg.on("mousemove", mouseMove);

    svg.selectAll("path")
     .data(states.features)
     .enter().append("path")
       .attr("class", "state")
       .attr("d", path)
       .attr("id", function(d) {return "state-" + d.properties.code;});

    svg.insert("path", ".graticule")
       .datum(topojson.mesh(us, us.objects.states, function(a, b) {return a !== b; }))
       .attr("class", "state-boundry")
       .attr("d", path);

};

queue()
   .defer(d3.json, "us-states-named.json")
   .await(function(){loadStates.apply(null, arguments); startRandom();});


//d3.select(self.frameElement).style("height", height + "px");
