var width = 900;
var height = 700;

var histData = [{key: "zipcodes", values: d3.range(0, 99).map(function(z) { return {"zip2": z.toString(), "count": 0};})}];

var chart;
nv.addGraph(function(){
    chart = nv.models.discreteBarChart()
	    .x(function(d) {return d.zip2;})
            .y(function(d) {return d.count;})
            .tooltips(true)
            .showValues(true)
            .transitionDuration(100);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.datum(histData)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
});

function randomData() {
    return Math.floor(Math.random() * 100).toString();
}

function startRandom() {
    var cnt = 0;
    setInterval(function(){
	var s = randomData();
	histData[0].values[s].count += 1; 
	cnt += 1;
	if (cnt == 10){
	    chart.update();
	    cnt = 0;
	}
    }, 1);
}

function onLoad(){
    d3.select("#randomStart")
	.on("click", startRandom);
}

onLoad();
