    document.addEventListener("DOMContentLoaded", function () {

        const carousel = document.querySelector(".carousel");
        const thumbnails = document.querySelectorAll(".thumbnails img");

        thumbnails.forEach(thumb => {
            thumb.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                carousel.style.transform = `translateX(-${index * 100}%)`;
            });
        });

    });