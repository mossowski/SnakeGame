$(document).ready(function() {
    var canvas,server,context;
    var stageHeight = 60;
    var stageWidth = 90;
    var id = null;

    server = window.location.host.name;
    canvas = $("#stage");
    context = canvas.get(0).getContext("2d"); 
  
    var snakeDirection = function(direction) {    
        return server.send(JSON.stringify({
            'direction': direction
        }));        
    };
   
    var draw = function(snakes,food) {
        var  snake, fud, x, y, i, j;
        var bestScore = 0;
        context.fillStyle = '#A9D0F5 '; 

        for (i = 0; i <= stageWidth; i++) {
            for (j = 0; j <= stageHeight; j++) {
                context.fillRect(i * 10, j * 10, 9, 9);
            }
        }

        for (i = 0; i < food.length; i++) {
            fud = food[i];
            context.fillStyle = '#66FF33'; 
            context.fillRect(fud.x * 10, fud.y * 10, 9, 9);      
        } 

        for (i = 0; i < snakes.length; i++) {
            snake = snakes[i];
            context.fillStyle = snake.id === id ? '#000000' : '#FF0000';

            if (snake.id === id) {
                $("#score").html("Your score: " + snake.length);
            }
            if (snake.length > bestScore) {
                $("#bestScore").html("Best score: " + snake.length);
                bestScore = snake.length;
            }
           
            for (j = 0; j < snake.length; j++) {
                x = snake.elements[j][0] * 10;
                y = snake.elements[j][1] * 10;
                context.fillRect(x, y, 9, 9);
            }
        }       
    };
  
    var connect = function() {
        server = new io.Socket(window.location.host.name, {'port': 3000 });
        server.connect();
        return server.on("message", function(event) {
            var message;
            message = JSON.parse(event);
            switch (message.type) {
                case 'id':
                     id = message.value;
                    return id;
                case 'snakes':
                    return draw(message.valueS,message.valueF);
            }
        });
    };
    
    connect();   

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