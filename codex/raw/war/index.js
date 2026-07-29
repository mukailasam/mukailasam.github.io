document.addEventListener("DOMContentLoaded", function() {
    const btn = document.createElement("button");
    btn.innerHTML = "↑ Top";
    btn.setAttribute("id", "backToTop");
    document.body.appendChild(btn);

    window.onscroll = function() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    };

    btn.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    const turtle = document.getElementById('turtle-container');
    let currentRotation = 0;

    turtle.addEventListener('click', function() {
        const msg = document.createElement('div');
        msg.className = 'turtle-message';
        msg.innerText = "Igba n ba jo K’onilu ma gbe ilu lọ";

        const rect = turtle.getBoundingClientRect();
        msg.style.left = `${rect.left}px`;
        msg.style.top = `${rect.top - 40}px`;

        document.body.appendChild(msg);

        setTimeout(() => {
            msg.remove();
        }, 3000);
    });

    function walkTurtle() {
        const rect = turtle.getBoundingClientRect();
        const curX = rect.left + rect.width / 2;
        const curY = rect.top + rect.height / 2;

        const destX = Math.random() * (window.innerWidth - 200) + 100;
        const destY = Math.random() * (window.innerHeight - 200) + 100;

        const targetRad = Math.atan2(destY - curY, destX - curX);
        let targetDeg = targetRad * (180 / Math.PI) + 90;

        let diff = (targetDeg - currentRotation) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        currentRotation += diff;

        turtle.style.transform = `rotate(${currentRotation}deg)`;
        turtle.style.left = `${destX}px`;
        turtle.style.top = `${destY}px`;
    }

    walkTurtle();
    setInterval(walkTurtle, 15000);
});