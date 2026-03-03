const orderBtns = document.querySelectorAll(".orderBtn");
const closeBtn = document.getElementById("closeBtn");
const modalOverlay = document.getElementById("modalOverlay");
const mainContent = document.getElementById("mainContent");
const navbar = document.getElementById("navbar");

orderBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    modalOverlay.classList.add("active");
    mainContent.classList.add("blur-active");
    navbar.classList.add("blur-active");
  });
});

closeBtn.addEventListener("click", () => {
  modalOverlay.classList.remove("active");
  mainContent.classList.remove("blur-active");
  navbar.classList.remove("blur-active");
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove("active");
    mainContent.classList.remove("blur-active");
    navbar.classList.remove("blur-active");
  }
});
