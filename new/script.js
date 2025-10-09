const btn = document.getElementById("destroyBtn");

// Grab all existing text elements
const elements = document.querySelectorAll("h1, p, span, button");

btn.addEventListener("click", () => {
    elements.forEach(el => {
        // Make draggable
        makeDraggable(el);

        // Random position on screen
        el.style.position = "absolute";
        el.style.left = Math.random() * (window.innerWidth - el.offsetWidth) + "px";
        el.style.top = Math.random() * (window.innerHeight - el.offsetHeight) + "px";

        // Random rotation
        el.style.transform = `rotate(${Math.random() * 360}deg)`;

        // Random color
        el.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;

        // Falling effect
        let pos = parseInt(el.style.top);
        const fall = setInterval(() => {
            if(pos < window.innerHeight - el.offsetHeight){
                pos += Math.random() * 5 + 1;
                el.style.top = pos + "px";
                el.style.transform = `rotate(${Math.random() * 360}deg)`;
            } else {
                clearInterval(fall);
            }
        }, 20);
    });
});

// Drag function
function makeDraggable(el){
    let offsetX, offsetY, dragging = false;

    el.addEventListener("mousedown", (e) => {
        dragging = true;
        el.classList.add("dragging");
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
        if(dragging){
            el.style.left = e.clientX - offsetX + "px";
            el.style.top = e.clientY - offsetY + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        if(dragging){
            dragging = false;
            el.classList.remove("dragging");
        }
    });
}