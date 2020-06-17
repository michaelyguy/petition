(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var hiddenCanvas = document.getElementById("hiddenSignature");
    // console.log("canvas is connecting", hiddenCanvas);

    canvas.addEventListener("mousedown", (event) => {
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
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    });

    canvas.addEventListener("mouseup", () => {
        console.log("im up");
        hiddenCanvas = canvas.toDataURL();
        // hiddenCanvas.value = canvas.toDataURL();
        console.log("----------");
        console.log(hiddenCanvas);

        // ctx.lineTo(event.offsetX, event.offsetY);
    });
})();
