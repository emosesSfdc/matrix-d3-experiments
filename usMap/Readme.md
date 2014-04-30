# Visualization demos #

You must serve these from an http server, because d3 issues an XHR for the data, which can't operate on a `file://` url.

If python is installed on your system, simply execute

> ./server [port]

in this directory for a simple http server rooted in this directory. `Port` defaults to 9001
