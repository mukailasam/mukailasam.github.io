window.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const id = entry.target.getAttribute("id");
                if (entry.intersectionRatio > 0.5) {
                    document
                        .querySelectorAll(".nav-links a")
                        .forEach((a) => a.classList.remove("active"));
                    document
                        .querySelector(`.nav-links a[href="#${id}"]`)
                        .classList.add("active");
                }
            });
        }, {
            threshold: 0.5,
        },
    );

    document.querySelectorAll("section").forEach((section) => {
        observer.observe(section);
    });
});

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