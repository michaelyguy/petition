(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var hiddenCanvas = document.getElementById("hiddenSignature");
    var isDrawing = false;

    canvas.addEventListener("mousedown", (event) => {
        isDrawing = true;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        console.log(event);
        ctx.beginPath();

        ctx.moveTo(event.offsetX, event.offsetY);
    });
    canvas.addEventListener("mousemove", (event) => {
        if (isDrawing) {
            ctx.lineTo(event.offsetX, event.offsetY);
            // console.log(event.clientX, event.clientY);

            ctx.stroke();
        }
    });

    document.addEventListener("mouseup", () => {
        isDrawing = false;
        hiddenCanvas.value = canvas.toDataURL();
        // console.log("-----HIDDEN CANVAS VALUE-----");
        // console.log(hiddenCanvas.value);
    });
})();
