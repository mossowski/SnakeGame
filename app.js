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
    //app.use(express.methodOverride());
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
var food = [];
var stageHeight = 60;
var stageWidth = 90;

var Food = (function() {

    function Food() {
        this.spawn();
    }

    Food.prototype.spawn = function() {
        var randomHeight = Math.floor(Math.random() * 50);
        var randomWidth = Math.floor(Math.random() * 65);
               
        this.x = randomWidth;
        this.y = randomHeight;  
    };

    return Food;
})();

var Snake = (function() {

    function Snake(id) {
        this.id = id;
        this.spawn();
    }

    Snake.prototype.spawn = function() {
        var i;
        var randomHeight = Math.floor(Math.random() * 50);
        var randomWidth = Math.floor(Math.random() * 65);
        this.length = snakeLength;
        this.direction = "right";

        var snakePosition = function(length) {
            var results = [];
            for (i =  length - 1; i >= 0; i--) {
                results.push([randomWidth + i, randomHeight]);
            }
            return results;
        };
        //console.log(snakePosition(this.length));
        this.elements = snakePosition(this.length); 
        return this.elements;   
    };

    Snake.prototype.grow = function(x,y) {           
        this.length += 1;
        this.elements.push([x, y]);
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
        this.elements[i][1] = this.elements[i + 1][1];
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

        if (this.elements[head][0] < 0) {
            this.elements[head][0] = stageWidth;
        }
        if (this.elements[head][1] < 0) {
            this.elements[head][1] = stageHeight;
        }
        if (this.elements[head][0] > stageWidth) {
            this.elements[head][0] = 0;
        }
        if (this.elements[head][1] > stageHeight) {
            this.elements[head][1] = 0;
        }  
    };

    Snake.prototype.head = function() {
        return this.elements[this.length - 1];
    };

    Snake.prototype.collisionSnake = function(other) {
        var collision, element, i, enemySnake;
        var head = this.head();
        var enemyHead = other.head();
        collision = false;
        //console.log("other" + other);
       // console.log("glowa: " + head);
        enemySnake = other.elements;
        for (i = 0; i < enemySnake.length; i++) {
            element = enemySnake[i];
            
            if (head[0] === element[0] && head[1] === element[1]) {
              // console.log("glowa: " + this.length-1);
              //console.log("miejsce uderzenia: " + i);
                if (head[0] === enemyHead[0] && head[1] === enemyHead[1])  {
                   // console.log("zderzenie glowami");
                    
                    if(this.direction === 'left')
                        this.direction = 'right';
                    else if (this.direction === 'right')
                        this.direction = 'left';
                    else if (this.direction === 'up')
                        this.direction = 'down';
                    else if (this.direction === 'down')
                        this.direction = 'up';

                    return collision;
                }
                else if ((head[0] === enemySnake[other.length-2][0] && head[1] === enemySnake[other.length-2][1]) || (enemyHead[0] === this.elements[this.length-2][0] && enemyHead[1] === this.elements[this.length-2][1])) {
                    
                    if(this.direction === 'left') {
                        this.elements[this.length-1][0] += 2;
                        this.direction = 'right';
                    }
                    else if (this.direction === 'right') {
                        this.elements[this.length-1][0] -= 2;
                        this.direction = 'left';
                    }
                    else if (this.direction === 'up') {
                        this.elements[this.length-1][1] += 2;
                        this.direction = 'down';
                    }
                    else if (this.direction === 'down') {
                        this.elements[this.length-1][1] -= 2;
                        this.direction = 'up';
                    }

                    return collision;
                }
                else {      
                  //  console.log("miejsce uderzenia: " + i);
                    return i+1;     //  indexy od 0 wiec +1
                }
            }
        }
        return collision;
    };

    Snake.prototype.collisionFood = function(food) {
        var collision;
        var head = this.head(); //tylko glowa
        collision = false;
        
        //console.log(food);
        if (head[0] === food.x && head[1] === food.y) {
            collision = true;
        }
        
        return collision;
    };

    return Snake;
})();

// Sockety

socket.on("connection", function(user) {
    var userId = autoId;
    var userSnake = new Snake(userId);
    var userFood = new Food();
    autoId++;
    snakes.push(userSnake);
    food.push(userFood);

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
        userSnake.direction = message.direction;
        return userSnake.direction;
    });

    user.on("disconnect", function() {
        var index = snakes.indexOf(userSnake);
        if(index > -1) {    //jestli istnieje
            snakes.splice(index,1);
        }
        return console.log("User with id:  " + userId + " disconnected");
    });
});

var updateGame = function() {
    var snake, i;

    for (i = 0; i < snakes.length; i++) {
        snake = snakes[i];
        snake.moveSnake();
    }

    checkCollisions();

    return socket.broadcast(JSON.stringify({ //convert to JSON
        type: 'snakes',
        valueS: snakes,
        valueF: food
    }));
};

var checkCollisions = function() {
    var other, snake, i, j, k, results, foood, head, cut;
    var resetSnakes = [];
    var resetFood = [];
    for (i = 0; i < snakes.length; i++) {
        snake = snakes[i];
      
        for (j = 0; j < snakes.length; j++) {
            other = snakes[j];
            head = snake.head(); 
            if (other !== snake) {
                if (snake.collisionSnake(other) !== false) {  //false || 0,1 itd.
                    cut = snake.collisionSnake(other);
                  //  console.log("cut: " + cut);
                 //   console.log("other length before cut: " + other.length);
                    if(other.length > 1) {
                        other.elements.splice(0,cut);
                        other.length -= cut;
                    }
                    
                 //   console.log("other length after cut: " + other.length);
                    for(k = 0; k < cut; k++)
                        snake.grow(head[0],head[1]);
                }
            }
        }
    
        for (j = 0; j < food.length; j++) {
            foood = food[j];
            head = snake.head();  

            if (snake.collisionFood(foood)) {
                resetFood.push(foood);
                snake.grow(head[0],head[1]);
            }          
        }
        results = [];

        for (j = 0; j < resetSnakes.length; j++) {
            other = resetSnakes[j];
            results.push(other.spawn());    
        }

        for(j = 0; j < resetFood.length; j++) {
            foood = resetFood[j];
            results.push(foood.spawn());
        }
    }
    return results;
};

setInterval(updateGame, 100);