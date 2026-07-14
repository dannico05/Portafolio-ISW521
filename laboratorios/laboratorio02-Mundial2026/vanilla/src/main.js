import './style.css';
import { 
    renderAppLayout, 
    setupTabs, 
    loadTabContent, 
    showLoginModal, 
    hideLoginModal,
    showToast 
} from './ui.js';
import { login, logout, getToken } from './api.js';

// ============================================================
// ARRANQUE DE LA APLICACIÓN
// ============================================================
(async () => {
    renderAppLayout();
    setupTabs();

    // ---- Botón Login ----
    document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('usernameInput').value; // El campo ahora es email
    const password = document.getElementById('passwordInput').value;
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';

    try {
        await login(email, password); // Ahora pasamos email
        hideLoginModal();
        document.getElementById('logoutBtn').style.display = 'block';
        showToast('✅ Sesión iniciada correctamente', 'success');
        
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            await loadTabContent(activeTab.dataset.tab);
        }
    } catch (error) {
        errorEl.style.display = 'block';
        errorEl.textContent = `❌ ${error.message}`;
    }
});

    // ---- Botón Logout ----
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        document.getElementById('logoutBtn').style.display = 'none';
        showLoginModal();
        showToast('🔒 Sesión cerrada', 'warning');
        
        // Limpiar todas las vistas
        document.querySelectorAll('.tab-content').forEach(section => {
            section.innerHTML = '🔒 Sesión cerrada. Inicia sesión para ver datos.';
            section.style.display = 'block';
        });
        // Detener polling si existe
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