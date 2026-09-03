const hamburger = document.getElementById('hamburger');
const navlinks = document.getElementById('navlinks');
const comming = document.getElementById('comming-soon');

comming.addEventListener('click', (e) => {
    e.preventDefault();
    alert('This feature is coming soon!, please send messages through my email:');
});

hamburger.addEventListener('click', () => {
    navlinks.classList.toggle('open');
});

// close menu after tapping a link
document.querySelectorAll('.topb').forEach(link => {
    link.addEventListener('click', () => {
        navlinks.classList.remove('open');
    });
});

// ===== SCROLL PROGRESS BAR =====
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
});

// ===== SCROLL REVEAL (IntersectionObserver) =====
const revealEls = document.querySelectorAll('.reveal, .stagger');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));