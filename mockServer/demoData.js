var io = require('socket.io').listen(9002)

var zip3Data = require('../usMap/zip3-simp.json');
var allRegions = zip3Data.objects.zip3.geometries.map(function(g) {return {zip3: g.properties.zip3, count: 0};});

var loop = function(socket){
    return function(){
	var zip = allRegions[Math.floor(Math.random() * allRegions.length)];
	zip.count += 1;
	socket.emit('topicMessage', zip);
    };
};

io.sockets.on('connection', function(socket) {
   var timer = setInterval(loop(socket), 10); 
   socket.on('disconnect', function(){
       clearInterval(timer);
   });
});    
