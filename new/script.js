const btn = document.getElementById("dropBtn");

const words = ["Hello!", "Random!", "Fun!", "Click me!", "Play!", "Wow!", "Surprise!", "Yay!", "Boom!", "Crazy!"];

btn.addEventListener("click", () => {
    // Create a new random word
    const word = words[Math.floor(Math.random() * words.length)];
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("droppable");

    // Random horizontal position at top
    span.style.left = Math.random() * (window.innerWidth - 100) + "px";
    span.style.top = "0px";

    document.body.appendChild(span);

    // Drop animation
    let position = 0;
    const dropInterval = setInterval(() => {
        if (position < window.innerHeight - 50) {
            position += 5;
            span.style.top = position + "px";
        } else {
            clearInterval(dropInterval);
        }
    }, 20);

    // Make draggable
    let offsetX, offsetY, dragging = false;

    span.addEventListener("mousedown", (e) => {
        dragging = true;
        span.classList.add("dragging");
        offsetX = e.clientX - span.offsetLeft;
        offsetY = e.clientY - span.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
        if (dragging) {
            span.style.left = e.clientX - offsetX + "px";
            span.style.top = e.clientY - offsetY + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        if (dragging) {
            dragging = false;
            span.classList.remove("dragging");
        }
    });
});