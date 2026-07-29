document.getElementById('librarySearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const sections = document.querySelectorAll('.library-sections section');
    const noResults = document.getElementById('noResults');
    let totalVisible = 0;

    if (searchTerm === "") {
        sections.forEach(section => {
            section.style.display = "block";
            const items = section.querySelectorAll('li');
            items.forEach(item => item.style.display = "");
        });
        noResults.style.display = "none";
        return;
    }

    sections.forEach((section) => {
        const items = section.querySelectorAll('li');
        let hasVisibleItems = false;

        items.forEach(item => {
            const text = item.textContent.toLowerCase().trim();

            if (text !== "" && text.includes(searchTerm)) {
                item.style.display = "";
                hasVisibleItems = true;
                totalVisible++;
            } else {
                item.style.display = "none";
            }
        });

        if (hasVisibleItems) {
            section.style.display = "block";
        } else {
            section.style.display = "none";
        }
    });

    if (totalVisible === 0) {
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
    }
});

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