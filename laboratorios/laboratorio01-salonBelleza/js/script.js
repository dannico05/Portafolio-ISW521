// ===== MODO OSCURO CON LOCALSTORAGE =====
(function() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Modo claro';
        } else {
            document.body.classList.remove('dark');
            if (themeToggleBtn) themeToggleBtn.textContent = '🌙 Modo oscuro';
        }
        localStorage.setItem('jireh-theme', theme);
    }
    
    const savedTheme = localStorage.getItem('jireh-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark');
            setTheme(isDark ? 'light' : 'dark');
        });
    }
})();

// ===== SLIDER DE TESTIMONIOS =====
(function() {
    const track = document.getElementById('sliderTrack');
    const slides = track ? track.querySelectorAll('.slide') : [];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('sliderDots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoSlideInterval = null;
    const AUTO_INTERVAL = 5000;

    function createDots() {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        const dots = dotsContainer.querySelectorAll('button');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
        resetAutoSlide();
    }
    function prevSlide() {
        goToSlide(currentIndex - 1);
        resetAutoSlide();
    }

    function resetAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, AUTO_INTERVAL);
        }
    }

    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, AUTO_INTERVAL);
    }

    // Pausar en hover
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
        });
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
        sliderContainer.addEventListener('focusin', () => {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
        });
        sliderContainer.addEventListener('focusout', startAutoSlide);
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    createDots();
    goToSlide(0);
    startAutoSlide();
})();

// ===== FORMULARIO DE CONTACTO (demo) =====
(function() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('¡Mensaje enviado (demo)! Nos pondremos en contacto contigo pronto.');
            contactForm.reset();
        });
    }
})();