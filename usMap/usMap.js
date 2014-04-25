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
    .range([0, 255]);

var states =["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

var stateCount = states.reduce(function(m, val){m[val] = 0; return m;}, {});

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
	document.getElementById("state-" + s).style.fill = d3.rgb(colorScale(count), 0, 0).toString();
    }, 50);
}

d3.json("us-states-named.json", function(error, us){
    var states = topojson.feature(us, us.objects.states);
    svg.insert("path", ".graticule")
       .datum(states)
       .attr("class", "land")
       .attr("d", path);

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

    startRandom();
});


//d3.select(self.frameElement).style("height", height + "px");
