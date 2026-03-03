document.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    
    if (!card) return;

    const foodModal = document.getElementById('food-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    const cardImg = card.querySelector('img').src;
    const cardTitle = card.querySelector('h3').innerText;
    const cardDesc = card.getAttribute('data-description') || "Freshly cooked and ready to serve!";

    modalImg.src = cardImg;
    modalTitle.innerText = cardTitle;
    modalDesc.innerText = cardDesc;

    foodModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
});

document.addEventListener('click', (e) => {
    const foodModal = document.getElementById('food-modal');
    
    if (e.target.classList.contains('close-food-btn') || e.target === foodModal) {
        foodModal.style.display = 'none';
        document.body.style.overflow = 'auto'; 
    }
});