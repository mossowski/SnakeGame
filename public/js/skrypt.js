$(document).ready(function() {
    var canvas,server,context;
    var stageHeight = 60;
    var stageWidth = 60;

    server = window.location.host.name;
    canvas = $("#stage");
    context = canvas.get(0).getContext("2d"); 

    var draw = function() {
        var x,y;
        context.fillStyle = '#A9D0F5 ';   
        for (x = 0; x <= stageWidth; x++) {
            for (y = 0; y <= stageHeight; y++) {
                context.fillRect(x * 10, y * 10, 9, 9);
            }
        }
    };

    draw();   
});
