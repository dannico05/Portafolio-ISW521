import { apiRequest, login, logout, getToken } from './api.js';

// ============================================================
// VARIABLES GLOBALES DE ESTADO
// ============================================================
let currentTab = 'ticker';
let bilingualData = { teams: null, stadiums: null };
let currentLang = 'en';

// ---- Estado para el Ticker (Polling) ----
let previousGames = [];
let pollingInterval = null;
let isPollingActive = false; // Evita solapamiento de peticiones

// ---- Estado para el Bracket (para mantener rondas ya resueltas) ----
let bracketState = { rounds: {}, errorRounds: {} };

// ============================================================
// TOASTS (Sistema de notificaciones no bloqueantes)
// ============================================================
export const showToast = (message, type = 'info', duration = 4000) => {
    // Eliminamos toasts antiguos para no saturar
    const existing = document.querySelectorAll('.custom-toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animación de entrada
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 500);
    }, duration);
};

// ============================================================
// MODAL DE LOGIN
// ============================================================
export const showLoginModal = () => {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
};

export const hideLoginModal = () => {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
};

// ============================================================
// COUNTDOWN GLOBAL (para 429 y 500)
// ============================================================
const showCountdown = (seconds, type) => {
    const div = document.getElementById('globalCountdown');
    const span = document.getElementById('countdownTimer');
    if (!div || !span) return;
    
    if (seconds > 0) {
        div.style.display = 'block';
        const label = type === 'rate_limit' ? 'Límite de tasa' : 'Error de servidor';
        span.textContent = `${seconds}s (${label})`;
    } else {
        div.style.display = 'none';
    }
};

// Escuchamos el evento global de countdown
window.addEventListener('countdown', (e) => {
    showCountdown(e.detail.seconds, e.detail.type);
});

// ============================================================
// RENDERIZADO PRINCIPAL (Estructura de la App)
// ============================================================
export const renderAppLayout = () => {
    const app = document.querySelector('#app');
    app.innerHTML = `
        <header class="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
            <h1 class="h4 m-0">🌍 Mundial 2026</h1>
            <button id="logoutBtn" class="btn btn-danger btn-sm" style="display:none;">Cerrar Sesión</button>
        </header>

        <nav class="d-flex gap-2 p-2 flex-wrap bg-light border-bottom">
            <button class="tab-btn btn btn-outline-primary active" data-tab="ticker">📺 Live Ticker</button>
            <button class="tab-btn btn btn-outline-primary" data-tab="exporter">📄 Exportador</button>
            <button class="tab-btn btn btn-outline-primary" data-tab="monitor">🚦 Monitor</button>
            <button class="tab-btn btn btn-outline-primary" data-tab="bilingual">🔀 Bilingüe</button>
            <button class="tab-btn btn btn-outline-primary" data-tab="bracket">🏆 Árbol</button>
        </nav>

        <div id="globalCountdown" class="alert alert-warning text-center m-2" style="display:none;">
            ⏳ Reintentando en: <span id="countdownTimer">5</span> segundos...
        </div>

        <main class="container-fluid p-3 flex-grow-1" style="min-height: 60vh;">
            <section id="ticker" class="tab-content active">Cargando Ticker...</section>
            <section id="exporter" class="tab-content" style="display:none;">Cargando Exportador...</section>
            <section id="monitor" class="tab-content" style="display:none;">Cargando Monitor...</section>
            <section id="bilingual" class="tab-content" style="display:none;">Cargando Buscador...</section>
            <section id="bracket" class="tab-content" style="display:none;">Cargando Árbol...</section>
        </main>

        <!-- MODAL DE LOGIN -->
        <div id="loginModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); justify-content:center; align-items:center; z-index:9999;">
            <div class="bg-white p-4 rounded shadow" style="width:350px; max-width:90%;">
                <h2 class="h5 mb-3">🔐 Iniciar Sesión</h2>
                <p class="text-muted small">Token expirado o no encontrado.</p>
                <input type="email" id="usernameInput" class="form-control mb-2" placeholder="Correo electrónico" value="admin@admin.com">
                <input type="password" id="passwordInput" class="form-control mb-2" placeholder="Contraseña" value="testpass">
                <button id="loginBtn" class="btn btn-success w-100">Iniciar Sesión</button>
                <p id="loginError" class="text-danger mt-2 small" style="display:none;">Error de autenticación</p>
            </div>
        </div>
    `;

    // Si ya hay token, ocultamos el modal
    if (getToken()) {
        document.getElementById('logoutBtn').style.display = 'block';
        hideLoginModal();
    } else {
        showLoginModal();
    }
};

// ============================================================
// FUNCIONES DE CARGA PARA CADA PESTAÑA
// ============================================================

// ---------- 2.1 LIVE TICKER (Con Polling) ----------
export const loadTicker = async () => {
    const container = document.getElementById('ticker');
    container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';

    // Detener polling anterior si existe
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    previousGames = [];

    // Función interna para obtener y actualizar
    const fetchAndUpdate = async () => {
        if (isPollingActive) return;
        isPollingActive = true;

        try {
            const { data, isStale } = await apiRequest('games');
            const games = data.games || [];

            // Detectar cambios en marcadores
            if (previousGames.length > 0) {
                games.forEach((newGame, index) => {
                    const oldGame = previousGames[index];
                    if (oldGame) {
                        const oldScore = `${oldGame.home_score ?? 0}-${oldGame.away_score ?? 0}`;
                        const newScore = `${newGame.home_score ?? 0}-${newGame.away_score ?? 0}`;
                        if (oldScore !== newScore) {
                            const homeName = newGame.home_team_name_en || 'Local';
                            const awayName = newGame.away_team_name_en || 'Visitante';
                            showToast(`⚽ ${homeName} ${newScore} ${awayName}`, 'info', 3000);
                        }
                    }
                });
            }
            previousGames = games;

            // Renderizar
            renderTicker(games, isStale);
            isPollingActive = false;
        } catch (error) {
            isPollingActive = false;
            if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') {
                showLoginModal();
                container.innerHTML = '<p class="text-warning">🔒 Sesión expirada. Inicia sesión de nuevo.</p>';
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                }
            } else if (error.name === 'AbortError') {
                // No hacer nada, es cancelación
            } else {
                // Si hay datos en caché, ya los mostró, solo mostramos error en consola
                console.warn('Error en polling:', error.message);
                // Mostramos un toast de error leve
                showToast('Error al actualizar marcadores', 'warning', 2000);
            }
        }
    };

    // Cargar primera vez y luego cada 5 segundos
    await fetchAndUpdate();
    pollingInterval = setInterval(fetchAndUpdate, 5000);
};

const renderTicker = (games, isStale) => {
    const container = document.getElementById('ticker');
    let html = `<h3 class="h5">Marcadores en Vivo ${isStale ? '<span class="badge bg-warning text-dark">Datos en caché ⚠️</span>' : ''}</h3>`;
    html += `<div class="list-group">`;
    if (games.length === 0) {
        html += `<div class="list-group-item text-muted">No hay partidos disponibles</div>`;
    } else {
        games.slice(0, 20).forEach(game => {
            const home = game.home_team_name_en || 'Local';
            const away = game.away_team_name_en || 'Visitante';
            const score = `${game.home_score ?? '?'} : ${game.away_score ?? '?'}`;
            html += `<div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${home} vs ${away}</span>
                <span class="badge bg-primary rounded-pill">${score}</span>
            </div>`;
        });
    }
    html += `</div>`;
    container.innerHTML = html;
};

// ---------- 2.2 EXPORTADOR DE REPORTES ----------
export const loadExporter = async () => {
    const container = document.getElementById('exporter');
    container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';

    try {
        // Usamos Promise.allSettled para que si uno falla, los otros sigan
        const results = await Promise.allSettled([
            apiRequest('games'),
            apiRequest('teams'),
            apiRequest('stadiums')
        ]);

        const gamesResult = results[0];
        const teamsResult = results[1];
        const stadiumsResult = results[2];

        const games = gamesResult.status === 'fulfilled' ? gamesResult.value.data?.games || [] : [];
        const teams = teamsResult.status === 'fulfilled' ? teamsResult.value.data?.teams || [] : [];
        const stadiums = stadiumsResult.status === 'fulfilled' ? stadiumsResult.value.data?.stadiums || [] : [];

        const gamesStale = gamesResult.status === 'fulfilled' ? gamesResult.value.isStale : false;
        const teamsStale = teamsResult.status === 'fulfilled' ? teamsResult.value.isStale : false;
        const stadiumsStale = stadiumsResult.status === 'fulfilled' ? stadiumsResult.value.isStale : false;

        let errorMessages = ''; // CARGAR UNA IMAGEN ANTES DE INCIAR SECCION DE BACKGROUND
        if (gamesResult.status === 'rejected') errorMessages += `<li>Partidos: ${gamesResult.reason.message}</li>`;
        if (teamsResult.status === 'rejected') errorMessages += `<li>Equipos: ${teamsResult.reason.message}</li>`;
        if (stadiumsResult.status === 'rejected') errorMessages += `<li>⚠️ Estadios: ${stadiumsResult.reason.message}</li>`;

        container.innerHTML = `
            <h3 class="h5">Reporte de Datos</h3>
            <div id="print-area" class="p-3 border rounded bg-light" style="border: 1px solid #dee2e6 !important;">
                <p><strong>Partidos:</strong> ${games.length} ${gamesStale ? '(caché)' : ''}</p>
                <p><strong>Equipos:</strong> ${teams.length} ${teamsStale ? '(caché)' : ''}</p>
                <p><strong>Estadios:</strong> ${stadiums.length} ${stadiumsStale ? '(caché)' : ''}</p>
                ${errorMessages ? `<div class="alert alert-danger mt-2"><strong>Secciones sin completar:</strong><ul>${errorMessages}</ul></div>` : ''}
                <button onclick="window.print()" class="btn btn-primary mt-3">
                    Exportar / Imprimir
                </button>
            </div>
        `;

        // Verificar si algún 401 ocurrió para mostrar modal
        const hasAuthError = results.some(r => r.status === 'rejected' && (r.reason.message === 'SESION_EXPIRADA' || r.reason.message === 'NO_AUTH'));
        if (hasAuthError) showLoginModal();

    } catch (error) {
        container.innerHTML = `<p class="text-danger">Error en exportador: ${error.message}</p>`;
    }
};

// ---------- 2.3 MONITOR DE INTEGRIDAD (con AbortController) ----------
export const loadMonitor = async () => {
    const container = document.getElementById('monitor');
    container.innerHTML = `
        <h3 class="h5">🚦 Monitor de Integridad</h3>
        <div class="row g-3 my-3">
            <div class="col-md-3 col-sm-6">
                <div class="card p-3 text-center" id="monitor-teams">
                    <h6>Equipos</h6>
                    <div class="display-6" id="status-teams"></div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card p-3 text-center" id="monitor-groups">
                    <h6>Grupos</h6>
                    <div class="display-6" id="status-groups"></div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card p-3 text-center" id="monitor-games">
                    <h6>Partidos</h6>
                    <div class="display-6" id="status-games"></div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card p-3 text-center" id="monitor-stadiums">
                    <h6>Estadios</h6>
                    <div class="display-6" id="status-stadiums"></div>
                </div>
            </div>
        </div>
        <button onclick="window.checkAllEndpoints()" class="btn btn-secondary"> Probar todos</button>
    `;
    await checkAllEndpoints();
};

const checkEndpoint = async (endpoint, timeout = 5000) => {
    const statusEl = document.getElementById(`status-${endpoint}`);
    const cardEl = document.getElementById(`monitor-${endpoint}`);
    if (!statusEl || !cardEl) return;

    statusEl.textContent = '⏳';
    cardEl.className = 'card p-3 text-center border-secondary';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const result = await apiRequest(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (result.data && Object.keys(result.data).length > 0) {
            statusEl.textContent = '✅';
            cardEl.className = 'card p-3 text-center border-success bg-success bg-opacity-10';
        } else {
            statusEl.textContent = '⚠️';
            cardEl.className = 'card p-3 text-center border-warning bg-warning bg-opacity-10';
        }
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            statusEl.textContent = '⏰';
            cardEl.className = 'card p-3 text-center border-warning bg-warning bg-opacity-10';
        } else if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') {
            statusEl.textContent = '🔒';
            cardEl.className = 'card p-3 text-center border-danger bg-danger bg-opacity-10';
            showLoginModal();
        } else {
            statusEl.textContent = '❌';
            cardEl.className = 'card p-3 text-center border-danger bg-danger bg-opacity-10';
        }
        return null;
    }
};

window.checkAllEndpoints = async function() {
    // Evaluamos de forma independiente con Promise.allSettled
    await Promise.allSettled([
        checkEndpoint('teams'),
        checkEndpoint('groups'),
        checkEndpoint('games'),
        checkEndpoint('stadiums')
    ]);
};

// ---------- 2.4 BUSCADOR BILINGÜE ----------
export const loadBilingual = async () => {
    const container = document.getElementById('bilingual');
    container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';

    try {
        if (!bilingualData.teams) {
            // Cargamos ambos en paralelo
            const [teamsRes, stadiumsRes] = await Promise.all([
                apiRequest('teams'),
                apiRequest('stadiums')
            ]);
            bilingualData.teams = teamsRes.data?.teams || [];
            bilingualData.stadiums = stadiumsRes.data?.stadiums || [];
        }
        renderBilingual();
    } catch (error) {
        if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') {
            showLoginModal();
            container.innerHTML = '<p class="text-warning">Sesión expirada.</p>';
        } else {
            container.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
        }
    }
};

const renderBilingual = () => {
    const container = document.getElementById('bilingual');
    const langLabel = currentLang === 'en' ? '🇬🇧 Inglés' : '🇮🇷 Persa';
    
    let html = `
        <h3 class="h5">Buscador Bilingüe</h3>
        <button onclick="window.toggleLanguage()" class="btn btn-info text-white mb-3">
            Cambiar a ${currentLang === 'en' ? 'Persa' : 'Inglés'}
        </button>
        <p>Idioma actual: <strong>${langLabel}</strong></p>
        <hr>
        <div class="row">
            <div class="col-md-6">
                <h5>Equipos:</h5>
                <ul class="list-group">
    `;
    if (bilingualData.teams && Array.isArray(bilingualData.teams)) {
        bilingualData.teams.slice(0, 30).forEach(team => {
            const name = currentLang === 'en' ? team.name_en : team.name_fa;
            html += `<li class="list-group-item">${name || 'Sin nombre'}</li>`;
        });
    }
    html += `</ul></div><div class="col-md-6"><h5>Estadios:</h5><ul class="list-group">`;
    if (bilingualData.stadiums && Array.isArray(bilingualData.stadiums)) {
        bilingualData.stadiums.slice(0, 30).forEach(stadium => {
            const name = currentLang === 'en' ? stadium.name_en : stadium.name_fa;
            html += `<li class="list-group-item">${name || 'Sin nombre'}</li>`;
        });
    }
    html += `</ul></div></div>`;
    container.innerHTML = html;
};

window.toggleLanguage = function() {
    currentLang = currentLang === 'en' ? 'fa' : 'en';
    renderBilingual();
};

// ---------- 2.5 ÁRBOL DE ELIMINATORIAS (con preservación de rondas) ----------
export const loadBracket = async () => {
    const container = document.getElementById('bracket');
    container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';

    try {
        const [gamesRes, teamsRes] = await Promise.all([
            apiRequest('games'),
            apiRequest('teams')
        ]);

        const allGames = gamesRes.data?.games || [];
        const teams = teamsRes.data?.teams || [];

        // Filtramos eliminatorias (todo lo que no sea "group")
        const knockoutGames = allGames.filter(g => g.type !== 'group' && g.type !== 'Group');

        if (knockoutGames.length === 0) {
            // Renderizamos casillas "Por definir"
            renderEmptyBracket(container);
            return;
        }

        // Agrupamos por ronda
        const rounds = {};
        knockoutGames.forEach(game => {
            const key = game.group || 'R?';
            if (!rounds[key]) rounds[key] = [];
            rounds[key].push(game);
        });

        // Guardamos el estado actual para futuras actualizaciones parciales
        bracketState.rounds = rounds;
        bracketState.errorRounds = {};

        renderBracket(container, rounds, teams);

    } catch (error) {
        if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') {
            showLoginModal();
            container.innerHTML = '<p class="text-warning">Sesión expirada.</p>';
            return;
        }

        // Si ya teníamos rondas guardadas, las mostramos y marcamos las nuevas como error
        if (Object.keys(bracketState.rounds).length > 0) {
            // Marcamos las rondas que intentamos cargar como error
            // (No sabemos cuáles eran, así que mostramos un mensaje en la parte superior)
            container.innerHTML = `
                <div class="alert alert-danger">Error al actualizar: ${error.message}. Mostrando datos anteriores.</div>
            `;
            renderBracket(container, bracketState.rounds, []);
        } else {
            // Si no hay nada, mostramos error y casillas vacías
            container.innerHTML = `<p class="text-danger">❌ Error en bracket: ${error.message}</p>`;
            renderEmptyBracket(container);
        }
    }
};

const renderBracket = (container, rounds, teams) => {
    const roundLabels = {
        'R32': 'Ronda de 32',
        'R16': 'Octavos',
        'QF': 'Cuartos',
        'SF': 'Semifinal',
        'FINAL': 'Final',
        'third': '3er Lugar'
    };
    const order = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'third'];

    let html = `<h3 class="h5">Árbol de Eliminatorias</h3><div class="bracket-container d-flex flex-wrap gap-4 justify-content-center">`;

    order.forEach(key => {
        if (!rounds[key]) return;
        const label = roundLabels[key] || key;
        html += `<div class="bracket-round bg-light p-3 rounded shadow-sm" style="min-width:180px; flex:1 1 auto;">`;
        html += `<h6 class="text-center border-bottom pb-2">${label}</h6>`;
        rounds[key].forEach(game => {
            const home = teams.find(t => t.id === game.home_team_id);
            const away = teams.find(t => t.id === game.away_team_id);
            const homeName = home?.name_en || (game.home_team_id === 0 ? 'Por definir' : '?');
            const awayName = away?.name_en || (game.away_team_id === 0 ? 'Por definir' : '?');
            html += `<div class="bracket-match bg-white p-2 my-2 border rounded text-center">${homeName} vs ${awayName}</div>`;
        });
        html += `</div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
};

const renderEmptyBracket = (container) => {
    const rounds = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'third'];
    const roundLabels = {
        'R32': 'Ronda de 32',
        'R16': 'Octavos',
        'QF': 'Cuartos',
        'SF': 'Semifinal',
        'FINAL': 'Final',
        'third': '3er Lugar'
    };

    let html = `<h3 class="h5">🏆 Árbol de Eliminatorias</h3><p class="text-muted">Sin datos de eliminatorias aún (fase de grupos). Casillas "Por definir".</p>`;
    html += `<div class="bracket-container d-flex flex-wrap gap-4 justify-content-center">`;
    rounds.forEach(key => {
        html += `<div class="bracket-round bg-light p-3 rounded shadow-sm" style="min-width:180px; flex:1 1 auto;">`;
        html += `<h6 class="text-center border-bottom pb-2">${roundLabels[key]}</h6>`;
        // Mostramos 2 casillas "Por definir" por ronda (simulando cuartos, etc)
        for (let i = 0; i < 4; i++) {
            html += `<div class="bracket-match bg-white p-2 my-2 border rounded text-center text-muted">Por definir</div>`;
        }
        html += `</div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
};

// ============================================================
// CONTROL DE PESTAÑAS
// ============================================================
export const setupTabs = () => {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Remover clase activa de todos
            buttons.forEach(b => {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-outline-primary');
            });
            // Activar el actual
            btn.classList.add('active', 'btn-primary');
            btn.classList.remove('btn-outline-primary');
            
            // Mostrar/ocultar secciones
            document.querySelectorAll('.tab-content').forEach(section => section.style.display = 'none');
            const tabId = btn.dataset.tab;
            const section = document.getElementById(tabId);
            if (section) section.style.display = 'block';
            
            currentTab = tabId;
            await loadTabContent(tabId);
        });
    });
};



export const loadTabContent = async (tabId) => {
    switch(tabId) {
        case 'ticker': await loadTicker(); break;
        case 'exporter': await loadExporter(); break;
        case 'monitor': await loadMonitor(); break;
        case 'bilingual': await loadBilingual(); break;
        case 'bracket': await loadBracket(); break;
        default: break;
    }
};