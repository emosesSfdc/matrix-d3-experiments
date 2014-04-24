var margin = {top: 10, right:30, bottom: 30, left:30};
var width=500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var barW = width/100 -1;

var buckets = 100;

var tInterval = 10;


function nextVal(){
    return Math.floor(1000 * Math.random());
}

var bucket = d3.scale.linear()
   .domain([0, 1000])
   .range([0, buckets]);

data = [];
for (var i = 0; i < buckets; i++){
    data.push({value: 0});
}

setInterval(function(){
    var index = Math.floor(bucket(nextVal()));
    data[index].value = data[index].value + 1;
    redraw();
}, tInterval);

var x = d3.scale.linear()
   .domain([0,buckets])
   .range([0, width]);

//y needs to get updated now and then
var y = d3.scale.linear()
   .domain([0, 10])
   .range([2, height]);

var chart = d3.select("body").append("svg")
   .attr("class", "chart")
   .attr("width", width)
   .attr("height", height);

chart.selectAll("rect")
   .data(data)
   .enter().append("rect")
     .attr("x", function(d, i) {return x(i) - 0.5;})
     .attr("y", function(d) {return  height-y(d.value) - 0.5;})
     .attr("width", barW)
     .attr("height", function(d) { return y(d.value); });

function redraw(){
    var rect = chart.selectAll("rect")
       .data(data)
       .transition()
       .duration(tInterval*0.90)
       .attr("y", function(d) {return height - y(d.value) -0.5;})
       .attr("height", function(d) {return y(d.value);});
}
