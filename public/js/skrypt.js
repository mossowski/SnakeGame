$(document).ready(function() {
    var canvas,server,context;
    var stageHeight = 60;
    var stageWidth = 60;
    var id = null;

    server = window.location.host.name;
    canvas = $("#stage");
    context = canvas.get(0).getContext("2d"); 
  
    var snakeDirection = function(direction) {    
        return server.send(JSON.stringify({
            'direction': direction
        }));        
    };
   
    var draw = function(snakes) {
        var  snake, x, y, i;
        context.fillStyle = '#A9D0F5 ';   
        for (x = 0; x <= stageWidth; x++) {
            for (y = 0; y <= stageHeight; y++) {
                context.fillRect(x * 10, y * 10, 9, 9);
            }
        }

        for (i = 0; i < snakes.length; i++) {
              snake = snakes[i];
              context.fillStyle = snake.id === id ? '#000000' : '#FF0000';
              var j;
           
              for (j = 0; j < snake.elements.length; j++) {
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
                    return id = message.value;
                case 'snakes':
                    return draw(message.value);
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
