$(document).ready(function() {

    var canvas,context;
    var id = null;
    var socket = io.connect('http://' + location.host);

    canvas = document.getElementById("stage");
    context = canvas.getContext("2d"); 

    var snakeDirection = function(direction) {    
        return socket.emit('direction', {'direction':  direction });        
    };
   
    var draw = function(snakes,food) {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var  snake, fud, x, y, i, j;
        var bestScore = 0;
        var xMiddle = canvas.width/2;  //srodek ekranu szerokosc
        var yMiddle = canvas.height/2;  //srodek ekranu wysokosc
        var xSnake, ySnake;    //pozycja weza
        var xPrzesun, yPrzesun;  //przesuniecie

        // pozycja weza
        for (i = 0; i < snakes.length; i++) {
            snake = snakes[i];

            if (snake.id === id) {
                xSnake = snake.elements[snake.length-1][0] * 10;
                ySnake = snake.elements[snake.length-1][1] * 10;
                //console.log("My snake x: " + xSnake + " y: " + ySnake);
            }
        } 

        // obliczanie przesuniecia 
        xPrzesun = xMiddle - xSnake;
        yPrzesun = yMiddle - ySnake;
        //console.log("srodek ekranu x: " + canvas.width/2 + " y: " + canvas.height/2);
        
        //mapa
        context.fillStyle = '#FFFFFF';     
        context.fillRect(0, 0, canvas.width, canvas.height);
         
        //food   
        for (i = 0; i < food.length; i++) {
            fud = food[i];
                
            if (fud.x * 10 < xSnake + canvas.width/2 && fud.x * 10 > xSnake - canvas.width/2) {
                if(fud.y * 10 < ySnake + canvas.height/2 && fud.y * 10 > ySnake - canvas.height/2) {
                    context.fillStyle = '#27B841'; 
                    context.fillRect(fud.x * 10 + xPrzesun, fud.y * 10 + yPrzesun, 9, 9); 
                    //console.log("draw food x: " + fud.x * 10 + " y: " + fud.y * 10);
                } 
            }   
        } 
 
        //snake
        for (i = 0; i < snakes.length; i++) {
            snake = snakes[i];
            context.fillStyle = snake.id === id ? '#000000' : '#FF0000';

            if (snake.id === id) {
                $("#score").html("Your score: " + snake.length);
                $("#position").html("X: " + snake.elements[snake.length - 1][0] + " Y: " +snake.elements[snake.length - 1][1]);
            }

            if (snake.length > bestScore) {
                $("#bestScore").html("Best score: " + snake.length);
                bestScore = snake.length;
            }
           
            for (j = 0; j < snake.length; j++) {
                x = snake.elements[j][0] * 10;
                y = snake.elements[j][1] * 10;

                if (x < xSnake + canvas.width/2 && x > xSnake - canvas.width/2) {
                    if(y < ySnake + canvas.height/2 && y > ySnake - canvas.height/2) {
                        context.fillRect(x + xPrzesun, y + yPrzesun, 9,9);
                        //console.log("draw snake x: " + x + " y: " + y);
                    }
                }
            }
        }       
    };
  
    socket.on('message', function(message) {
            switch (message.type) {
                case 'id':
                    id = message.value;
                    return id;
                case 'snakes':
                    return draw(message.valueS,message.valueF);
            }
    });
  
    return $(document).keydown(function(event) {
        var key;
        key = event.keyCode;
        switch (key) {
            case 37:
                return snakeDirection("left");
            case 38:
                return snakeDirection("up");
            case 39:
                return snakeDirection("right");
            case 40:
                return snakeDirection("down");
        }
    });   
});