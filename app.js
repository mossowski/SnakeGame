var express = require('express');
var routes = require('./routes');
var path = require('path');
var less = require('less-middleware');
var app = express();
var http = require('http').createServer(app);
var socketio = require('socket.io');
var socket = socketio.listen(http);

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser('bardzo tajne aqq'));
    app.use(express.session());
    app.use(app.router);
    // „middleware” obsługujące LESS-a
    // samo kompiluje pliki less-owe do CSS
    // a do tego pliki wynikowe kompresuje
    // Opis parametrów:
    //
    // https://github.com/emberfeather/less.js-middleware
    app.use(less({
        src: path.join(__dirname, 'less'),
        dest: path.join(__dirname, 'public/css'),
        prefix: '/css',
        compress: true
    }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'bower_components/jquery/dist')));
});

app.configure('development', function () {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
});

app.get('/', routes.index);

http.listen(app.get('port'), function () {
    console.log("Serwer nasłuchuje na porcie " + app.get('port'));
});

var snakeLength = 3;        //poczatkowa dlugosc weza
var autoId = 1;       
var snakes = [];        //tablica wezow

Snake = (function() {

    function Snake(id) {
        this.id = id;
        this.spawn();
    }

    Snake.prototype.spawn = function() {
        var i;
        var randomHeight = Math.floor(Math.random() * 50);
        var randomWidth = Math.floor(Math.random() * 45);
        this.length = snakeLength;
        this.direction = "right";

        var snakePosition = function(length) {
            var results = [];
            for (i =  length - 1; i >= 0; i--) {
                results.push([randomWidth + i, randomHeight]);
            }
            return results;
        };
        console.log(snakePosition(this.length));
        return this.elements = snakePosition(this.length);   
    };

    Snake.prototype.moveSnake = function() { 
        //var head = this.length - 1;
        //console.log("x: " + this.elements[head][0] + "  y: " + this.elements[head][1]);  
        //console.log("Dlugosc weza: " + this.length);
        var i;
        for (i = 0; i <= this.length - 2; i++) {
        this.moveTail(i);
        }  
        return this.moveHead();
    };

    Snake.prototype.moveTail = function(i) {
        this.elements[i][0] = this.elements[i + 1][0];
        return this.elements[i][1] = this.elements[i + 1][1];
    };
    
    Snake.prototype.moveHead = function() {
        var head = this.length - 1;

        switch (this.direction) {
        
        case "left":
            this.elements[head][0] -= 1;
            break;
        case "right":
            this.elements[head][0] += 1;
            break;
        case "up":
            this.elements[head][1] -= 1;
            break;
        case "down":
            this.elements[head][1] += 1;
            break;
        }    
    };

    Snake.prototype.head = function() {
      return this.elements[this.length - 1];
    };

    return Snake;
})();

// Sockety

socket.on("connection", function(user) {
    var userId = autoId;
    var userSnake = new Snake(userId);
    autoId++;
    snakes.push(userSnake);

    console.log("User with id:  " + userId + " connected");

    user.send(JSON.stringify({
      type: 'id',
      value: userId
    }));

    user.on("message", function(message) {
        //console.log("message  = " + message);
        message = JSON.parse(message);
        //console.log("message  = " + message);
        //console.log("message direction = " + message.direction);
        return userSnake.direction = message.direction;
    });

    user.on("disconnect", function() {
        var index = snakes.indexOf(userSnake);
        if(index > -1) {
            snakes.splice(index,1);
        }
        return console.log("User with id:  " + userId + " disconnected");
    });
});

updateGame = function() {
    var snake, i;
    for (i = 0; i < snakes.length; i++) {
      snake = snakes[i];
      snake.moveSnake();
    }
    return socket.broadcast(JSON.stringify({
      type: 'snakes',
      value: snakes
    }));
};

setInterval(updateGame, 100);