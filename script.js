document.addEventListener("DOMContentLoaded", function() {
    const copyButtons = document.querySelectorAll(".copy-button");

    copyButtons.forEach((button) => {
        button.addEventListener("click", function() {
            const targetId = this.dataset.targetCode;
            const codeElement = document.getElementById(targetId);

            if (codeElement) {
                navigator.clipboard
                    .writeText(codeElement.textContent)
                    .then(() => {
                        button.textContent = "Copied!";
                        setTimeout(() => {
                            button.textContent = "Copy";
                        }, 2000);
                    })
                    .catch((err) => {
                        console.error("Failed to copy text: ", err);
                    });
            }
        });
    });
});


const backToTopButton = document.getElementById("backToTop");

window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
};

// Scroll to top when clicked
backToTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});