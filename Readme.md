# Some d3 experiments

To get the json files to load, you need to be running an http server in the directory you want to serve.  For example 

    $ cd usMap
    $ python -m SimpleHTTPServer 9001

will start a webserver on localhost:9001, and you can go to http://localhost:9001/usMap.html to see that file, or http://localhost:9001/zip3map.html to see the zip3 map.

Currently zip3 map is expecting to connect to a socket.io socket on the same host on port 9002 to get a stream of zip3 JSON data.  If you'd like to spin up a mock data server, in a separate shell do

	$ cd mockServer
	$ node install    #only has to be run once, to download dependencies
	$ node demoData
	

