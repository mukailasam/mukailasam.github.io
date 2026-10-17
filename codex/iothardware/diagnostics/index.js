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
});