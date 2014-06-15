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
var foodAmount = 500;

var Food = (function() {

    function Food() {
        this.spawn();
    }

    Food.prototype.spawn = function() {
        var sign = Math.random() < 0.5 ? -1 : 1;
        var randomHeight = Math.floor(Math.random() * 500 * sign);
        var randomWidth = Math.floor(Math.random() * 500 * sign);
        //console.log("Spawned food x: " + randomWidth + " y: " + randomHeight);       
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
        var sign = Math.random() < 0.5 ? -1 : 1;
        var randomHeight = Math.floor(Math.random() * 120 * sign);
        var randomWidth = Math.floor(Math.random() * 120 * sign);
        this.length = snakeLength;
        this.direction = "up";

        var snakePosition = function(length) {
            var results = [];
            for (i =  length - 1; i >= 0; i--) {
                results.push([randomWidth + i, randomHeight]);
            }
            return results;
        };
        this.elements = snakePosition(this.length); 
        return this.elements;   
    };

    Snake.prototype.grow = function(x,y) {           
        this.length += 1;
        this.elements.push([x, y]);
    };

    Snake.prototype.moveSnake = function() { 
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

        /*if (this.elements[head][0] < 0) {
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
        }  */
    };

    Snake.prototype.head = function() {
        return this.elements[this.length - 1];
    };

    Snake.prototype.collisionSnake = function(other) {

        var collision, element, i, enemySnake;
        var head = this.head();
        var enemyHead = other.head();
        collision = false;
        enemySnake = other.elements;

        for (i = 0; i < enemySnake.length; i++) {
            element = enemySnake[i];
            
            if (head[0] === element[0] && head[1] === element[1]) {   //zderzenie
             
                if (head[0] === enemyHead[0] && head[1] === enemyHead[1])  {       //glowami
                 //  console.log("zderzenie glowami"); //zwykle zderzenie 
                    if(this.direction === 'left')
                    {            
                        for(i=0; i< this.length; i++)
                        {
                            this.elements[i][0] += 6;
                        }  
                        for(i=0; i< other.length; i++)
                        {
                            other.elements[i][0] -= 6;
                        }   
                    }
                    else if (this.direction === 'right')
                    { 
                        for(i=0; i< this.length; i++)
                        {
                            this.elements[i][0] -= 6;
                        }
                        for(i=0; i< other.length; i++)
                        {
                            other.elements[i][0] += 6;
                        }           
                    }
                    else if (this.direction === 'up')
                    {
                        for(i=0; i< this.length; i++)
                        {
                            this.elements[i][1] += 6;
                        }
                        for(i=0; i< other.length; i++)
                        {
                            other.elements[i][1] -= 6;
                        }
                    }  
                    else if (this.direction === 'down')
                    {
                        for(i=0; i< this.length; i++)
                        {
                            this.elements[i][1] -= 6;
                        }
                        for(i=0; i< other.length; i++)
                        {
                            other.elements[i][1] += 6;
                        }
                    }

                    return collision;
                }
                else if (this.length === 1 || other.length === 1) { 
                    if(this.length === 1) {
                        if ((head[0] === other.elements[other.length - 2][0] && head[1] === other.elements[other.length-2][1]) && (this.direction === 'up' && other.direction ==='down') || (this.direction === 'down' && other.direction ==='up') || (this.direction === 'right' && other.direction ==='left') || (this.direction === 'left' && other.direction ==='right')) {
                      //console.log("waz dl 1");
                            if((this.direction === 'left') && (enemyHead[0] === head[0] + 1)) {
                               // console.log("1");
                                for(i=0; i< this.length; i++)
                                {
                                   this.elements[i][0] += 6;
                                }
                                for(i=0; i< other.length; i++)
                                {
                                   other.elements[i][0] -=6;
                                }
                            }
                            else if ((this.direction === 'right') && (enemyHead[0] === head[0] - 1)) {
                               // console.log("2");
                                for(i=0; i< this.length; i++)
                                {
                                    this.elements[i][0] -= 6;
                                }
                                for(i=0; i< other.length; i++)
                                {
                                    other.elements[i][0] +=6;
                                }
                            }
                            else if ((this.direction === 'up') && (enemyHead[1] === head[1] + 1)) {
                               // console.log("3");
                                for(i=0; i< this.length; i++)
                                {
                                    this.elements[i][1] += 6;
                                }
                                for(i=0; i< other.length; i++)
                                {
                                    other.elements[i][1] -=6;
                                }
                            }
                            else if ((this.direction === 'down') && (enemyHead[1] === head[1] - 1)) {
                               // console.log("4");
                                for(i=0; i< this.length; i++)
                                {
                                    this.elements[i][1] -= 6;
                                }
                                for(i=0; i< other.length; i++)
                                {
                                    other.elements[i][1] +=6;
                                }
                            }
                            else {      
                                //console.log("else cuttttt");
                                return i+1;     //  indexy od 0 wiec +1
                            }

                            return collision;
                        }
                        else {      
                           // console.log("else cutomg1");
                            return i+1;     //  indexy od 0 wiec +1
                        }
                    }
                }
                else if ((head[0] === other.elements[other.length - 2][0] && head[1] === other.elements[other.length-2][1]) && (enemyHead[0] === this.elements[this.length - 2][0] && enemyHead[1] === this.elements[this.length-2][1])) {
                    //console.log("dziwne");
                    if(this.direction === 'left') {
                        for(i=0; i< this.length; i++)
                        {
                            this.elements[i][0] += 6;
                        }
                        for(i=0; i< other.length; i++)
                        {
                            other.elements[i][0] -=6;
                        }
                    }
                    else if (this.direction === 'right') {
                        for(i=0; i< this.length; i++)
                        {
                            this.elements[i][0] -= 6;
                        }
                        for(i=0; i< other.length; i++)
                        {
                            other.elements[i][0] +=6;
                        }
                    }
                    else if (this.direction === 'up') {
                        for(i=0; i< this.length; i++)
                        {
                            this.elements[i][1] += 6;
                        }
                        for(i=0; i< other.length; i++)
                        {
                            other.elements[i][1] -=6;
                        }
                    }
                    else if (this.direction === 'down') {
                        for(i=0; i< this.length; i++)
                        {
                            this.elements[i][1] -= 6;
                        }
                        for(i=0; i< other.length; i++)
                        {
                            other.elements[i][1] +=6;
                        }
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
        var head = this.head(); 
        collision = false;
        
        if (head[0] === food.x && head[1] === food.y) {
            collision = true;
        }
        
        return collision;
    };

    return Snake;
})();

// Sockety

socket.on("connection", function(socket) {

    var userId = autoId;
    var userSnake = new Snake(userId);
    autoId++;
    snakes.push(userSnake);
    console.log("User with id:  " + userId + " connected");

    socket.emit('message', { type:  'id', value: userId });

    socket.on('direction', function(message) {
        userSnake.direction = message.direction;
        return userSnake.direction;
    });

    socket.on("disconnect", function() {
        var index = snakes.indexOf(userSnake);
        if(index > -1) {    //jestli istnieje
            snakes.splice(index,1);
        }
        return console.log("User with id:  " + userId + " disconnected");
    });
});

var generateFood = function() {
    for(i = 0; i < foodAmount; i++) {
        var newFood = new Food();
        food.push(newFood);
    }     
 // console.log("Wygenerowano food");
};

var updateGame = function() {
    var snake, i;

    for (i = 0; i < snakes.length; i++) {
        snake = snakes[i];
        snake.moveSnake();
    }

    checkCollisions();

    return socket.emit('message',{ 
        type: 'snakes',
        valueS: snakes,
        valueF: food
    });
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
                    if(other.length > 1) {       // jesli wiecej niz sama glowa
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

generateFood();
setInterval(updateGame, 100);
