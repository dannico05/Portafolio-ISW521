// script.js - Modo oscuro con localStorage
(function() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement; // o body, pero nosotros aplicamos clase al body
    
    // Función para aplicar tema
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Modo claro';
        } else {
            document.body.classList.remove('dark');
            if (themeToggleBtn) themeToggleBtn.textContent = '🌙 Modo oscuro';
        }
        // Guardar en localStorage
        localStorage.setItem('jireh-theme', theme);
    }
    
    // Cargar tema guardado al iniciar
    const savedTheme = localStorage.getItem('jireh-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Si no hay preferencia, detectar preferencia del sistema (opcional)
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Evento del botón
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark');
            setTheme(isDark ? 'light' : 'dark');
        });
    }
    
    // Pequeña mejora: recordar que el formulario no hace envío real (solo demo)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Mensaje enviado (demo). Gracias por contactarnos.');
            contactForm.reset();
        });
    }
})();