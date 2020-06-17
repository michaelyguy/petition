(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var hiddenCanvas = document.getElementById("hiddenSignature");
    // console.log("canvas is connecting", hiddenCanvas);
    var isDrawing = false;

    canvas.addEventListener("mousedown", (event) => {
        isDrawing = true;
        console.log(event);
        console.log("im down");
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        console.log(event);
        ctx.moveTo(event.offsetX, event.offsetY);
    });
    canvas.addEventListener("mousemove", (event) => {
        console.log("im moving");
        if (isDrawing) {
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        }
    });

    document.addEventListener("mouseup", () => {
        isDrawing = false;
        console.log("im up");
        hiddenCanvas.value = canvas.toDataURL();
        // hiddenCanvas.value = canvas.toDataURL();
        console.log("----------");
        console.log(hiddenCanvas);

        // ctx.lineTo(event.offsetX, event.offsetY);
    });
})();
