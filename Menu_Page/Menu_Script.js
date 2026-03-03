let productsCache = [];

fetch('http://localhost:3000/api/products')
  .then(res => res.json())
  .then(products => {
    productsCache = products;


    document.querySelectorAll('.card').forEach(card => populateCard(card));

   
    initCarousels();
  })
  .catch(err => console.error('Failed to fetch products:', err));

function populateCard(card) {
    const id = parseInt(card.dataset.id);
    const product = productsCache.find(p => p.id === id);
    if (!product) return; 


    card.dataset.description = product.description;

    card.innerHTML = `
        <img src="${product.img}" alt="${product.name}">
        <div class="overlap-content">
            <h3>${product.name}</h3>
        </div>
    `;
}

function initCarousels() {
    const itemWidth = 400; 
    const gap = 30;        
    const visibleItems = 3; 
    const stepDistance = itemWidth + gap;

    document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
        const track = wrapper.querySelector('.track');
        const prevBtn = wrapper.querySelector('.prev-btn');
        const nextBtn = wrapper.querySelector('.next-btn');
        
       
        const originalCards = Array.from(track.children);
        const totalItems = originalCards.length; 
        
        const firstClones = originalCards.slice(0, visibleItems).map(c => c.cloneNode(true));
        const lastClones = originalCards.slice(-visibleItems).map(c => c.cloneNode(true));

        firstClones.forEach(c => track.appendChild(c));
        lastClones.reverse().forEach(c => track.prepend(c));

        let currentIndex = visibleItems; 
        let isTransitioning = false;

        const updatePosition = (enableTransition = true) => {
            track.style.transition = enableTransition ? 'transform 0.4s ease-in-out' : 'none';
            track.style.transform = `translateX(${-currentIndex * stepDistance}px)`;
        };

        updatePosition(false);

        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            updatePosition(true);
        });

        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex--;
            updatePosition(true);
        });

        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentIndex >= visibleItems + totalItems) {
                currentIndex = visibleItems;
                updatePosition(false);
            } else if (currentIndex <= 0) {
                currentIndex = totalItems;
                updatePosition(false);
            }
        });
    });
}


const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle('show', entry.isIntersecting);
    });
});
document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));