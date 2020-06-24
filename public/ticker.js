(function () {
    var allLinks = document.getElementById("links");
    var link = allLinks.getElementsByTagName("a");
    var left = allLinks.offsetLeft;
    var reqId;
    function move() {
        left--;
        if (-link[0].offsetWidth > left) {
            left = left + link[0].offsetWidth;
            var removedLink = allLinks.removeChild(link[0]);
            allLinks.appendChild(removedLink);
        }
        allLinks.style.left = left + "px";

        reqId = requestAnimationFrame(move);
    }

    move();
    for (var i = 0; i < link.length; i++) {
        link[i].addEventListener("mouseover", function (event) {
            cancelAnimationFrame(reqId);
            event.target.style.color = "black";
        });
        link[i].addEventListener("mouseout", function (event) {
            requestAnimationFrame(move);
            event.target.style.color = "saddlebrown";
        });
    }
})();
