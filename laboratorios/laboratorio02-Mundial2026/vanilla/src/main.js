import './style.css';
import { 
    renderAppLayout, 
    setupTabs, 
    loadTabContent, 
    showLoginModal, 
    hideLoginModal,
    showToast,
    initAccessibility
} from './ui.js';
import { login, logout, getToken } from './api.js';

// ============================================================
// ARRANQUE DE LA APLICACION
// ============================================================
(async () => {
    renderAppLayout();
    setupTabs();
    initAccessibility();

    // ---- Boton Login ----
    document.getElementById('loginBtn').addEventListener('click', async () => {
        const email = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;
        const errorEl = document.getElementById('loginError');
        errorEl.style.display = 'none';

        try {
            await login(email, password);
            hideLoginModal();
            document.getElementById('logoutBtn').style.display = 'block';
            showToast('Sesion iniciada correctamente', 'success');
            
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                await loadTabContent(activeTab.dataset.tab);
            }
        } catch (error) {
            errorEl.style.display = 'block';
            errorEl.textContent = error.message;
        }
    });

    // ---- Boton Logout ----
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        document.getElementById('logoutBtn').style.display = 'none';
        showLoginModal();
        showToast('Sesion cerrada', 'warning');
        
        document.querySelectorAll('.tab-content').forEach(section => {
            section.innerHTML = 'Sesion cerrada. Inicia sesion para ver datos.';
            section.style.display = 'block';
        });

        if (window._pollingInterval) {
            clearInterval(window._pollingInterval);
            window._pollingInterval = null;
        }
    });

    // ---- Carga inicial ----
    if (getToken()) {
        await loadTabContent('ticker');
    } else {
        showLoginModal();
    }
})();
