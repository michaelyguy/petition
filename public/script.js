(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", (event) => {
        // console.log("im down");
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        // console.log(event);
        ctx.moveTo(event.offsetX, event.offsetY);
        canvas.addEventListener("mousemove", (eventTwo) => {
            // console.log("im moving");
            // console.log("im up");
            ctx.lineTo(eventTwo.offsetX, eventTwo.offsetY);
        });
        canvas.addEventListener("mouseup", () => {
            ctx.lineTo(10, 10);
            ctx.lineTo(20, 20);
            ctx.lineTo(30, 30);
            ctx.lineTo(40, 40);
            ctx.lineTo(50, 50);

            ctx.closePath();
        });
    });
})();
