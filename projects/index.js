// 1. Back to Top Logic
const backToTopButton = document.getElementById("backToTop");

window.onscroll = function() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
};

backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// 2. Real-time Project Filtering Search
const searchInput = document.getElementById("projectSearch");
const projectNodes = document.querySelectorAll(".project-node");
const noResults = document.getElementById("noResults");

searchInput.addEventListener("input", function(e) {
    const query = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    projectNodes.forEach(node => {
        const titleText = node.querySelector(".project-title").textContent.toLowerCase();
        const descText = node.querySelector(".project-desc").textContent.toLowerCase();
        const tagText = node.querySelector(".project-tag").textContent.toLowerCase();

        const match = titleText.includes(query) || descText.includes(query) || tagText.includes(query);

        if (match) {
            node.style.display = "block";
            visibleCount++;
        } else {
            node.style.display = "none";
        }
    });

    if (visibleCount === 0 && query !== "") {
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
    }
});