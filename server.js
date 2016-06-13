// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
// create the express app
var app = express();
// static content 
// require body-parser
var bodyParser = require('body-parser');
// use it!
app.use(bodyParser.urlencoded());

app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// root route to render the index.ejs view
app.get('/', function(req, res) {
 res.render("index");
});

// tell the express app to listen on port 8000
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
});

var io = require('socket.io').listen(server);

var users = {};
var messages = [];

io.sockets.on('connection', function(socket){
	console.log('socket id is: ', socket.id)
	//socket for new user
	socket.on('new_user', function(data){
		//checks if key/id exist in object
		if (!(data.name in users)){
			//set id as key and name as value
			users[data.name] = socket.id
 			socket.emit('load_messages', {messages: messages})
			//broadcast to all users the new user that entered the chatroom
 			io.emit('display_new_user',{new_user: data.name})
		}
		console.log('All users',users)
	});
	socket.on('sending_message', function(data){
		console.log('message received')
		console.log(data.message)
		console.log('user name', data.name)
		messages.push({name: data.name, message: data.message})
		console.log(messages)
		//after message is sent, broadcast messages to all users in chat
		io.emit('broadcast_messages', {messages: messages})
	});
	socket.on('user_disconnected', function(data){
		io.emit('broadcast_dc', {name: data.name});
	});

});


