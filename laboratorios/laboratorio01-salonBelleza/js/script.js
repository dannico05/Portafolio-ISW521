// ===== MODO OSCURO =====
(function() {
    const savedTheme = localStorage.getItem('jireh-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
    }
    // Sincronizar botón del panel (se actualiza en el módulo de accesibilidad)
})();

// ===== SLIDER DE TESTIMONIOS (INFINITO + ACCESIBLE) =====
(function() {
    const track = document.getElementById('sliderTrack');
    const slides = track ? track.querySelectorAll('.slide') : [];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('sliderDots');
    if (!track || slides.length === 0) return;

    // Clonar slides para efecto infinito
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);
    const allSlides = track.querySelectorAll('.slide');
    const totalSlides = allSlides.length;

    let currentIndex = 1;
    let autoSlideInterval = null;
    const AUTO_INTERVAL = 4000; // 4 segundos
    let isFocusChange = false;

    function createDots() {
        dotsContainer.innerHTML = '';
        const realSlides = slides.length;
        for (let i = 0; i < realSlides; i++) {
            const dot = document.createElement('button');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
            dot.setAttribute('tabindex', '0');
            dot.classList.toggle('active', i === 0);
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            
            dot.addEventListener('focus', function() {
                if (!isFocusChange) {
                    isFocusChange = true;
                    goToSlide(i + 1);
                    resetAutoSlide();
                    setTimeout(() => {
                        this.focus();
                        isFocusChange = false;
                    }, 10);
                }
            });

            dot.addEventListener('click', function(e) {
                e.preventDefault();
                goToSlide(i + 1);
                resetAutoSlide();
                this.focus();
            });

            dot.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToSlide(i + 1);
                    resetAutoSlide();
                    this.focus();
                }
            });
            dotsContainer.appendChild(dot);
        }
    }

    function goToSlide(index, noTransition = false) {
        if (noTransition) track.style.transition = 'none';
        else track.style.transition = 'transform 0.6s ease-in-out';
        track.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;

        const realSlides = slides.length;
        let realIndex = (index - 1 + realSlides) % realSlides;
        const dots = dotsContainer.querySelectorAll('button');
        dots.forEach((dot, i) => {
            const isActive = i === realIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
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
            autoSlideInterval = null;
        }
        autoSlideInterval = setInterval(nextSlide, AUTO_INTERVAL);
        console.log('Auto slide reiniciado');
    }
    function startAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
        autoSlideInterval = setInterval(nextSlide, AUTO_INTERVAL);
        console.log('Auto slide iniciado');
    }

    // Loop infinito
    track.addEventListener('transitionend', () => {
        const realSlides = slides.length;
        if (currentIndex === 0) {
            track.style.transition = 'none';
            track.style.transform = `translateX(-${realSlides * 100}%)`;
            currentIndex = realSlides;
        } else if (currentIndex === totalSlides - 1) {
            track.style.transition = 'none';
            track.style.transform = `translateX(-${1 * 100}%)`;
            currentIndex = 1;
        }
        // Actualizar dots
        const realIndex = (currentIndex - 1 + realSlides) % realSlides;
        const dots = dotsContainer.querySelectorAll('button');
        dots.forEach((dot, i) => {
            const isActive = i === realIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    });

    // Eventos botones prev/next
    if (prevBtn) {
        prevBtn.addEventListener('click', () => { prevSlide(); });
        prevBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                prevSlide();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => { nextSlide(); });
        nextBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                nextSlide();
            }
        });
    }

    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
                console.log('Auto slide pausado (hover)');
            }
        });
        sliderContainer.addEventListener('mouseleave', () => {
            if (!autoSlideInterval) {
                startAutoSlide();
                console.log('Auto slide reanudado (hover)');
            }
        });
        sliderContainer.addEventListener('focusin', () => {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
                console.log('Auto slide pausado (focus)');
            }
        });
        sliderContainer.addEventListener('focusout', () => {
            if (!autoSlideInterval) {
                startAutoSlide();
                console.log('Auto slide reanudado (focus)');
            }
        });
    }

    createDots();
    goToSlide(1, true);
    setTimeout(startAutoSlide, 100);
})();

// ===== FORMULARIO =====
(function() {
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('¡Mensaje enviado (demo)! Nos pondremos en contacto contigo pronto.');
            form.reset();
        });
    }
})();

// ===== NAVBAR DINÁMICO =====
(function() {
    const header = document.getElementById('siteHeader');
    const threshold = 80;
    window.addEventListener('scroll', () => {
        if (window.scrollY > threshold) header.classList.add('shrink');
        else header.classList.remove('shrink');
    });
})();

// ===== PANEL DE ACCESIBILIDAD =====
(function() {
    const toggleBtn = document.getElementById('accessToggle');
    const optionsDiv = document.getElementById('accessOptions');
    let panelVisible = false;

    toggleBtn.addEventListener('click', () => {
        panelVisible = !panelVisible;
        optionsDiv.style.display = panelVisible ? 'flex' : 'none';
    });

    // Tamaño de fuente
    const sizeBtns = document.querySelectorAll('[data-size]');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const size = btn.dataset.size;
            let fontSize = '16px';
            if (size === 'small') fontSize = '14px';
            else if (size === 'medium') fontSize = '18px';
            else if (size === 'large') fontSize = '22px';
            document.documentElement.style.fontSize = fontSize;
            localStorage.setItem('jireh-font-size', fontSize);
        });
    });

    const savedFontSize = localStorage.getItem('jireh-font-size');
    if (savedFontSize) {
        document.documentElement.style.fontSize = savedFontSize;
        sizeBtns.forEach(btn => {
            const size = btn.dataset.size;
            if ((size === 'small' && savedFontSize === '14px') ||
                (size === 'medium' && savedFontSize === '18px') ||
                (size === 'large' && savedFontSize === '22px')) {
                btn.classList.add('active');
            }
        });
    } else {
        document.querySelector('[data-size="medium"]')?.classList.add('active');
    }

    // Modo oscuro
    const darkBtn = document.getElementById('accessDarkMode');
    if (darkBtn) {
        darkBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark');
            document.body.classList.toggle('dark');
            localStorage.setItem('jireh-theme', isDark ? 'light' : 'dark');
            darkBtn.textContent = isDark ? '🌙 Modo oscuro' : '☀️ Modo claro';
        });
        if (document.body.classList.contains('dark')) {
            darkBtn.textContent = '☀️ Modo claro';
        }
    }

    // Alto contraste
    const contrastBtn = document.getElementById('accessHighContrast');
    if (contrastBtn) {
        contrastBtn.addEventListener('click', () => {
            const isHigh = document.body.classList.toggle('high-contrast');
            localStorage.setItem('jireh-high-contrast', isHigh ? 'true' : 'false');
            contrastBtn.textContent = isHigh ? '🔆 Contraste normal' : '🔆 Alto contraste';
        });
        if (localStorage.getItem('jireh-high-contrast') === 'true') {
            document.body.classList.add('high-contrast');
            contrastBtn.textContent = '🔆 Contraste normal';
        }
    }
})();