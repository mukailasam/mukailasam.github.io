document.addEventListener("DOMContentLoaded", function () {
    const copyButtons = document.querySelectorAll(".copy-button");

    copyButtons.forEach((button) => {
        button.addEventListener("click", function () {
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