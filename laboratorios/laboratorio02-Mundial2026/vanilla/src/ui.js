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
let isPollingActive = false;
let backoffTimeout = null;

// ---- Estado para el Bracket ----
let bracketState = { rounds: {}, errorRounds: {} };

// ============================================================
// TOASTS
// ============================================================
export const showToast = (message, type = 'info', duration = 4000) => {
    const existing = document.querySelectorAll('.custom-toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

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
// COUNTDOWN GLOBAL
// ============================================================
const showCountdown = (seconds, type) => {
    const div = document.getElementById('globalCountdown');
    const span = document.getElementById('countdownTimer');
    if (!div || !span) return;

    if (seconds > 0) {
        div.style.display = 'block';
        const label = type === 'rate_limit' ? 'Limite de tasa' : 'Error de servidor';
        span.textContent = `${seconds}s (${label})`;
    } else {
        div.style.display = 'none';
    }
};

window.addEventListener('countdown', (e) => {
    showCountdown(e.detail.seconds, e.detail.type);
});

// ============================================================
// ACCESIBILIDAD
// ============================================================
export const initAccessibility = () => {
    const savedSize = localStorage.getItem('accessibility_font') || 'medium';
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${savedSize}`);

    const savedContrast = localStorage.getItem('accessibility_contrast') || 'normal';
    if (savedContrast === 'high') {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }

    const activeSizeBtn = document.querySelector(`.font-size-option[data-size="${savedSize}"]`);
    if (activeSizeBtn) {
        document.querySelectorAll('.font-size-option').forEach(b => b.classList.remove('active'));
        activeSizeBtn.classList.add('active');
    }

    const activeContrastBtn = document.querySelector(`.contrast-option[data-contrast="${savedContrast}"]`);
    if (activeContrastBtn) {
        document.querySelectorAll('.contrast-option').forEach(b => b.classList.remove('active'));
        activeContrastBtn.classList.add('active');
    }
};

const setupAccessibilityListeners = () => {
    const accBtn = document.getElementById('accessibilityBtn');
    const accMenu = document.getElementById('accessibilityMenu');
    if (accBtn && accMenu) {
        accBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accBtn.closest('.accessibility-dropdown').classList.toggle('open');
        });
        document.addEventListener('click', () => {
            accBtn.closest('.accessibility-dropdown').classList.remove('open');
        });
        accMenu.addEventListener('click', (e) => e.stopPropagation());
    }

    document.querySelectorAll('.font-size-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            document.body.classList.remove('font-small', 'font-medium', 'font-large');
            document.body.classList.add(`font-${size}`);
            localStorage.setItem('accessibility_font', size);
            document.querySelectorAll('.font-size-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelectorAll('.contrast-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const contrast = btn.dataset.contrast;
            if (contrast === 'high') {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
            localStorage.setItem('accessibility_contrast', contrast);
            document.querySelectorAll('.contrast-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
};

// ============================================================
// RENDERIZADO PRINCIPAL
// ============================================================
export const renderAppLayout = () => {
    const app = document.querySelector('#app');
    app.innerHTML = `
        <header class="app-header">
            <h1 class="header-title">Mundial 2026</h1>
            <div class="header-right">
                <div class="accessibility-dropdown">
                    <button id="accessibilityBtn" class="accessibility-btn">&#9881; Accesibilidad</button>
                    <div id="accessibilityMenu" class="dropdown-menu">
                        <div class="dropdown-section">
                            <span class="dropdown-section-title">Tamano de fuente</span>
                            <button class="dropdown-item font-size-option" data-size="small">Pequeno</button>
                            <button class="dropdown-item font-size-option active" data-size="medium">Mediano</button>
                            <button class="dropdown-item font-size-option" data-size="large">Grande</button>
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-section">
                            <span class="dropdown-section-title">Contraste</span>
                            <button class="dropdown-item contrast-option active" data-contrast="normal">Normal</button>
                            <button class="dropdown-item contrast-option" data-contrast="high">Alto contraste</button>
                        </div>
                    </div>
                </div>
                <button id="logoutBtn" class="btn btn-sm btn-outline-danger" style="display:none;">Cerrar Sesion</button>
            </div>
        </header>

        <nav class="app-nav">
            <button class="tab-btn active" data-tab="ticker">Live Ticker</button>
            <button class="tab-btn" data-tab="exporter">Exportador</button>
            <button class="tab-btn" data-tab="monitor">Monitor</button>
            <button class="tab-btn" data-tab="bilingual">Bilingue</button>
            <button class="tab-btn" data-tab="bracket">Arbol</button>
        </nav>

        <div id="globalCountdown" class="alert alert-warning text-center m-2" style="display:none;">
            Reintentando en: <span id="countdownTimer">5</span> segundos...
        </div>

        <main class="container-fluid p-3 flex-grow-1" style="min-height: 60vh;">
            <section id="ticker" class="tab-content active">Cargando Ticker...</section>
            <section id="exporter" class="tab-content" style="display:none;">Cargando Exportador...</section>
            <section id="monitor" class="tab-content" style="display:none;">Cargando Monitor...</section>
            <section id="bilingual" class="tab-content" style="display:none;">Cargando Buscador...</section>
            <section id="bracket" class="tab-content" style="display:none;">Cargando Arbol...</section>
        </main>

        <div id="loginModal" class="login-overlay" style="display:none;">
            <div class="login-card">
                <div class="login-header">
                    <h2>Mundial 2026</h2>
                    <p>Inicia sesion para acceder al sistema</p>
                </div>
                <div class="login-body">
                    <input type="email" id="usernameInput" class="form-control mb-2" placeholder="Correo electronico" value="admin@admin.com">
                    <input type="password" id="passwordInput" class="form-control mb-2" placeholder="Contrasena" value="testpass">
                    <button id="loginBtn" class="btn btn-primary w-100">Iniciar Sesion</button>
                    <p id="loginError" class="text-danger mt-2 small" style="display:none;">Error de autenticacion</p>
                </div>
            </div>
        </div>
    `;

    setupAccessibilityListeners();
    initAccessibility();

    if (getToken()) {
        document.getElementById('logoutBtn').style.display = 'block';
        hideLoginModal();
    } else {
        showLoginModal();
    }
};

// ============================================================
// SPLASH (CUANDO NO HAY TOKEN)
// ============================================================
const showSplash = (container) => {
    container.innerHTML = `
        <div class="splash-screen">
            <h2>Bienvenido al Sistema Mundial 2026</h2>
            <p>Inicia sesion para acceder a los datos del torneo.</p>
        </div>
    `;
};

// ============================================================
// LIVE TICKER (Con Polling)
// ============================================================

/**
 * Carga y muestra los marcadores en vivo con polling cada 10 segundos.
 *
 * Flujo de errores:
 * - Si recibe 429: apiRequest despacha backoff_start, este listener
 *   detiene el polling y lo reinicia cuando el backoff termina.
 * - Si recibe 500: apiRequest hace backoff silencioso (sin countdown),
 *   el polling se detiene y reinicia automáticamente.
 * - Si recibe 401/NO_AUTH: detiene polling y muestra modal de login.
 * - Si falla la red: si hay caché, muestra datos stale; si no, error.
 */
export const loadTicker = async () => {
    const container = document.getElementById('ticker');
    container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';

    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    if (backoffTimeout) {
        clearTimeout(backoffTimeout);
        backoffTimeout = null;
    }
    previousGames = [];

    const fetchAndUpdate = async () => {
        if (isPollingActive) return;
        isPollingActive = true;

        try {
            const { data, isStale } = await apiRequest('games');
            const games = data.games || [];

            if (previousGames.length > 0) {
                games.forEach((newGame, index) => {
                    const oldGame = previousGames[index];
                    if (oldGame) {
                        const oldScore = `${oldGame.home_score ?? 0}-${oldGame.away_score ?? 0}`;
                        const newScore = `${newGame.home_score ?? 0}-${newGame.away_score ?? 0}`;
                        if (oldScore !== newScore) {
                            const homeName = newGame.home_team_name_en || 'Local';
                            const awayName = newGame.away_team_name_en || 'Visitante';
                            showToast(`${homeName} ${newScore} ${awayName}`, 'info', 3000);
                        }
                    }
                });
            }
            previousGames = games;

            renderTicker(games, isStale);
            isPollingActive = false;
        } catch (error) {
            isPollingActive = false;
            if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') {
                showLoginModal();
                container.innerHTML = '<p class="text-warning">Sesion expirada. Inicia sesion de nuevo.</p>';
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                }
            } else if (error.name === 'AbortError') {
                // cancelacion
            } else {
                console.warn('Error en polling:', error.message);
            }
        }
    };

    const handleBackoffStart = (e) => {
        const { waitMs, type } = e.detail;

        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }

        if (type === 'rate_limit') {
            showToast('Actualizacion en pausa', 'warning', 3000);
        }

        backoffTimeout = setTimeout(() => {
            backoffTimeout = null;
            pollingInterval = setInterval(fetchAndUpdate, 10000);
        }, waitMs);
    };

    window.addEventListener('backoff_start', handleBackoffStart);

    await fetchAndUpdate();
    pollingInterval = setInterval(fetchAndUpdate, 10000);
};

const renderTicker = (games, isStale) => {
    const container = document.getElementById('ticker');
    let html = `<h3 class="h5">Marcadores en Vivo ${isStale ? '<span class="badge bg-warning text-dark">Datos en cache</span>' : ''}</h3>`;
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

// ============================================================
// EXPORTADOR DE REPORTES
// ============================================================

/**
 * Genera un reporte exportable con todos los partidos, cruzando datos
 * de games, teams y stadiums. Si algún recurso falla, muestra
 * "No disponible" en esa columna pero permite exportar igualmente.
 *
 * Flujo de errores:
 * - Usa Promise.allSettled para que cada petición sea independiente.
 * - Si algún recurso falla, se muestra como error pero no bloquea los demás.
 * - Si hay error 401 en alguno, muestra modal de sesión expirada.
 */
export const loadExporter = async () => {
    const container = document.getElementById('exporter');
    container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';

    try {
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

        const hasAuthError = results.some(r => r.status === 'rejected' && (r.reason.message === 'SESION_EXPIRADA' || r.reason.message === 'NO_AUTH'));
        if (hasAuthError) {
            showLoginModal();
            return;
        }

        let tableRows = '';
        if (games.length > 0) {
            games.forEach(game => {
                const homeTeam = teams.find(t => t.id === game.home_team_id);
                const awayTeam = teams.find(t => t.id === game.away_team_id);
                const stadium = stadiums.find(s => s.id === game.stadium_id);

                const homeName = homeTeam?.name_en || (game.home_team_name_en || null);
                const awayName = awayTeam?.name_en || (game.away_team_name_en || null);
                const stadiumName = stadium?.name_en || null;

                const homeDisplay = homeName || '<span class="na">No disponible</span>';
                const awayDisplay = awayName || '<span class="na">No disponible</span>';
                const stadiumDisplay = stadiumName || '<span class="na">No disponible</span>';
                const scoreDisplay = (game.home_score != null && game.away_score != null)
                    ? `${game.home_score} : ${game.away_score}`
                    : '<span class="na">No disponible</span>';

                tableRows += `<tr>
                    <td>${homeDisplay}</td>
                    <td>${awayDisplay}</td>
                    <td>${stadiumDisplay}</td>
                    <td>${scoreDisplay}</td>
                </tr>`;
            });
        } else {
            tableRows = '<tr><td colspan="4" class="text-muted text-center">No hay partidos disponibles</td></tr>';
        }

        let errorMessages = '';
        if (gamesResult.status === 'rejected') errorMessages += `<li>Partidos: ${gamesResult.reason.message}</li>`;
        if (teamsResult.status === 'rejected') errorMessages += `<li>Equipos: ${teamsResult.reason.message}</li>`;
        if (stadiumsResult.status === 'rejected') errorMessages += `<li>Estadios: ${stadiumsResult.reason.message}</li>`;

        container.innerHTML = `
            <h3 class="h5">Reporte de Datos</h3>
            <div id="print-area" class="p-3 border rounded bg-light" style="border: 1px solid #dee2e6 !important;">
                <div class="mb-3">
                    <p class="mb-1"><strong>Partidos:</strong> ${games.length} ${gamesStale ? '(cache)' : ''}</p>
                    <p class="mb-1"><strong>Equipos:</strong> ${teams.length} ${teamsStale ? '(cache)' : ''}</p>
                    <p class="mb-1"><strong>Estadios:</strong> ${stadiums.length} ${stadiumsStale ? '(cache)' : ''}</p>
                </div>
                ${errorMessages ? `<div class="alert alert-danger mt-2"><strong>Secciones sin completar:</strong><ul class="mb-0">${errorMessages}</ul></div>` : ''}
                <table id="export-table" class="table table-bordered table-sm mt-3">
                    <thead>
                        <tr>
                            <th>Equipo Local</th>
                            <th>Equipo Visitante</th>
                            <th>Estadio</th>
                            <th>Marcador</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <button onclick="window.print()" class="btn btn-primary mt-3">
                    Exportar / Imprimir
                </button>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">Error en exportador: ${error.message}</p>`;
    }
};

// ============================================================
// MONITOR DE INTEGRIDAD
// ============================================================

/**
 * Verifica el estado de cada endpoint de la API de forma secuencial
 * con un delay de 800ms entre cada uno (para visualizar el proceso).
 *
 * Características:
 * - Cada petición usa skipCache: true para verificar estado real.
 * - Cada petición tiene timeout de 5s con AbortController.
 * - Indicador visual: OK (verde), Timeout (amarillo), Error (rojo).
 * - Las peticiones son independientes (si una falla, las demás siguen).
 *
 * Flujo de errores:
 * - Si el timeout expira: AbortError → muestra "Timeout".
 * - Si recibe 401: muestra "Sesión" y abre modal de login.
 * - Si falla la red: muestra "Error".
 * - Si responde OK: muestra "OK" con fondo verde.
 */
export const loadMonitor = async () => {
    const container = document.getElementById('monitor');
    container.innerHTML = `
        <h3 class="h5">Monitor de Integridad</h3>
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
        <button onclick="window.checkAllEndpoints()" class="btn btn-secondary">Probar todos</button>
    `;
    await checkAllEndpoints();
};

const checkEndpoint = async (endpoint, timeout = 5000) => {
    const statusEl = document.getElementById(`status-${endpoint}`);
    const cardEl = document.getElementById(`monitor-${endpoint}`);
    if (!statusEl || !cardEl) return;

    statusEl.textContent = '...';
    cardEl.className = 'card p-3 text-center border-secondary';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const result = await apiRequest(endpoint, { signal: controller.signal, skipCache: true });
        clearTimeout(timeoutId);

        if (result.data && Object.keys(result.data).length > 0) {
            statusEl.textContent = 'OK';
            cardEl.className = 'card p-3 text-center border-success bg-success bg-opacity-10';
        } else {
            statusEl.textContent = 'Vacio';
            cardEl.className = 'card p-3 text-center border-warning bg-warning bg-opacity-10';
        }
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            statusEl.textContent = 'Timeout';
            cardEl.className = 'card p-3 text-center border-warning bg-warning bg-opacity-10';
        } else if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') {
            statusEl.textContent = 'Sesion';
            cardEl.className = 'card p-3 text-center border-danger bg-danger bg-opacity-10';
            showLoginModal();
        } else {
            statusEl.textContent = 'Error';
            cardEl.className = 'card p-3 text-center border-danger bg-danger bg-opacity-10';
        }
        return null;
    }
};

// Se ejecutan las peticiones secuencialmente con un delay artificial
// para que el usuario pueda ver el proceso de cada endpoint.
// Se usa skipCache: true para verificar el estado real de la API.
window.checkAllEndpoints = async function() {
    const endpoints = ['teams', 'groups', 'games', 'stadiums'];
    for (let i = 0; i < endpoints.length; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 800));
        await checkEndpoint(endpoints[i]);
    }
};

// ============================================================
// BUSCADOR BILINGUE
// ============================================================

/**
 * Muestra equipos y estadios con soporte bilingüe (inglés/persa).
 * Los datos se cargan una sola vez y se almacenan en memoria.
 * El switch de idioma actualiza el DOM sin nuevas peticiones,
 * usando atributos data-i18n, data-name-en y data-name-fa.
 *
 * Flujo de errores:
 * - Si falla la carga de datos: muestra error en el contenedor.
 * - Si recibe 401: muestra modal de sesión expirada.
 * - Si el usuario cambia idioma durante la carga: al recibir datos,
 *   renderBilingual() usa el currentLang actual, respetando la elección.
 */
export const loadBilingual = async () => {
    const container = document.getElementById('bilingual');
    container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';

    try {
        if (!bilingualData.teams) {
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
            container.innerHTML = '<p class="text-warning">Sesion expirada.</p>';
        } else {
            container.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
        }
    }
};

const renderBilingual = () => {
    const container = document.getElementById('bilingual');
    const langLabel = currentLang === 'en' ? 'Ingles' : 'Persa';

    let teamsHtml = '';
    if (bilingualData.teams && Array.isArray(bilingualData.teams)) {
        bilingualData.teams.slice(0, 30).forEach(team => {
            const name = currentLang === 'en' ? team.name_en : team.name_fa;
            teamsHtml += `<li class="list-group-item" 
                data-i18n="team-${team.id}" 
                data-name-en="${team.name_en || ''}" 
                data-name-fa="${team.name_fa || ''}"
            >${name || 'Sin nombre'}</li>`;
        });
    }

    let stadiumsHtml = '';
    if (bilingualData.stadiums && Array.isArray(bilingualData.stadiums)) {
        bilingualData.stadiums.slice(0, 30).forEach(stadium => {
            const name = currentLang === 'en' ? stadium.name_en : stadium.name_fa;
            stadiumsHtml += `<li class="list-group-item" 
                data-i18n="stadium-${stadium.id}" 
                data-name-en="${stadium.name_en || ''}" 
                data-name-fa="${stadium.name_fa || ''}"
            >${name || 'Sin nombre'}</li>`;
        });
    }

    container.innerHTML = `
        <h3 class="h5">Buscador Bilingue</h3>
        <button class="btn btn-info text-white mb-3 btn-lang-toggle" onclick="window.toggleLanguage()">
            Cambiar a ${currentLang === 'en' ? 'Persa' : 'Ingles'}
        </button>
        <p>Idioma actual: <strong>${langLabel}</strong></p>
        <hr>
        <div class="row">
            <div class="col-md-6">
                <h5>Equipos:</h5>
                <ul class="list-group bilingual-teams-list">${teamsHtml}</ul>
            </div>
            <div class="col-md-6">
                <h5>Estadios:</h5>
                <ul class="list-group bilingual-stadiums-list">${stadiumsHtml}</ul>
            </div>
        </div>
    `;
};

const applyLanguage = (lang) => {
    const elements = document.querySelectorAll('#bilingual [data-i18n]');
    elements.forEach(el => {
        const nameKey = lang === 'en' ? 'data-name-en' : 'data-name-fa';
        const name = el.getAttribute(nameKey);
        if (name) el.textContent = name;
    });

    const toggleBtn = document.querySelector('#bilingual .btn-lang-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = `Cambiar a ${lang === 'en' ? 'Persa' : 'Ingles'}`;
    }

    const langLabel = document.querySelector('#bilingual .lang-current');
    if (langLabel) {
        langLabel.textContent = lang === 'en' ? 'Ingles' : 'Persa';
    }
};

window.toggleLanguage = function() {
    currentLang = currentLang === 'en' ? 'fa' : 'en';
    applyLanguage(currentLang);
};

// ============================================================
// ARBOL DE ELIMINATORIAS
// ============================================================

// Orden preferido de las rondas conocidas. Se usa SOLO para ordenar,
// no para iterar. El bracket se construye con las keys de los datos.
const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', 'FINAL', '3RD'];

const ROUND_LABELS = {
    'R32': 'Ronda de 32',
    'R16': 'Octavos',
    'QF': 'Cuartos',
    'SF': 'Semifinal',
    'FINAL': 'Final',
    '3RD': '3er Lugar'
};

/**
 * Ordena las keys de las rondas: primero las conocidas en orden,
 * luego las desconocidas alfabéticamente.
 */
const sortRoundKeys = (keys) => {
    return keys.sort((a, b) => {
        const ia = ROUND_ORDER.indexOf(a);
        const ib = ROUND_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
    });
};

/**
 * Carga el bracket visual de eliminatorias.
 * Agrupa los partidos por round/stage dinámico (no usa array fijo).
 * El bracket se construye con las keys que vienen de los datos,
 * ordenadas según un orden preferido conocido.
 *
 * Flujo de errores:
 * - Si falla la petición pero ya hay rondas guardadas en bracketState,
 *   se conservan las rondas previas y se marcan las nuevas como error.
 * - Si no hay datos previos, muestra "Por definir" para cada ronda.
 * - Si recibe 401: detiene todo y muestra modal de sesión expirada.
 */
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

        const knockoutGames = allGames.filter(g => g.type !== 'group' && g.type !== 'Group');

        if (knockoutGames.length === 0) {
            renderEmptyBracket(container);
            return;
        }

        // Agrupar por round/stage dinámico (no usar array fijo)
        const rounds = {};
        knockoutGames.forEach(game => {
            const key = game.round || game.stage || game.group || 'unknown';
            if (!rounds[key]) rounds[key] = [];
            rounds[key].push(game);
        });

        bracketState.rounds = rounds;
        bracketState.errorRounds = {};

        renderBracket(container, rounds, teams, []);

    } catch (error) {
        if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') {
            showLoginModal();
            container.innerHTML = '<p class="text-warning">Sesion expirada.</p>';
            return;
        }

        if (Object.keys(bracketState.rounds).length > 0) {
            // Marcamos como error las rondas que estaban en el estado previo
            // pero que no se pudieron actualizar
            const errorRounds = Object.keys(bracketState.rounds).filter(
                r => !bracketState.rounds[r] || bracketState.rounds[r].length === 0
            );
            renderBracket(container, bracketState.rounds, [], errorRounds);
            showToast('Error al actualizar algunas rondas', 'warning', 3000);
        } else {
            container.innerHTML = `<p class="text-danger">Error en bracket: ${error.message}</p>`;
            renderEmptyBracket(container);
        }
    }
};

const renderBracket = (container, rounds, teams, errorRounds = []) => {
    let html = `<h3 class="h5">Arbol de Eliminatorias</h3>`;
    html += `<div class="bracket-container">`;

    // Construir bracket con las keys de los datos, ordenadas dinámicamente
    const roundKeys = sortRoundKeys(Object.keys(rounds));

    // Si hay rondas en error que no están en los datos, agregarlas al final
    errorRounds.forEach(key => {
        if (!roundKeys.includes(key)) roundKeys.push(key);
    });

    // Si no hay rondas pero hay errorRounds, usar esas
    if (roundKeys.length === 0 && errorRounds.length > 0) {
        errorRounds.forEach(key => roundKeys.push(key));
    }

    // Si no hay nada, mostrar "Por definir" para las rondas esperadas
    if (roundKeys.length === 0) {
        ROUND_ORDER.forEach(key => roundKeys.push(key));
    }

    roundKeys.forEach(key => {
        const label = ROUND_LABELS[key] || key;
        const hasError = errorRounds.includes(key);
        const roundClass = hasError ? 'bracket-round error-state' : 'bracket-round';

        html += `<div class="${roundClass}">`;
        html += `<div class="bracket-round-title">${label}</div>`;

        if (hasError) {
            html += `<div class="bracket-match"><span class="error-label">Error al cargar</span></div>`;
        } else if (rounds[key] && rounds[key].length > 0) {
            rounds[key].forEach(game => {
                const home = teams.find(t => t.id === game.home_team_id);
                const away = teams.find(t => t.id === game.away_team_id);
                const homeName = home?.name_en || (game.home_team_id === 0 ? 'Por definir' : (game.home_team_name_en || '?'));
                const awayName = away?.name_en || (game.away_team_id === 0 ? 'Por definir' : (game.away_team_name_en || '?'));

                const hasScore = game.home_score != null && game.away_score != null;
                const scoreHtml = hasScore ? `<span class="score">${game.home_score} : ${game.away_score}</span>` : '';

                html += `<div class="bracket-match">
                    <span class="team-names">${homeName} vs ${awayName}</span>
                    ${scoreHtml}
                </div>`;
            });
        } else {
            for (let i = 0; i < getExpectedMatches(key); i++) {
                html += `<div class="bracket-match pending">Por definir</div>`;
            }
        }

        html += `</div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
};

const getExpectedMatches = (round) => {
    switch (round) {
        case 'R32': return 16;
        case 'R16': return 8;
        case 'QF': return 4;
        case 'SF': return 2;
        case 'FINAL': return 1;
        case '3RD': return 1;
        default: return 2; // Para rondas desconocidas, mostrar 2 casillas
    }
};

const renderEmptyBracket = (container) => {
    let html = `<h3 class="h5">Arbol de Eliminatorias</h3>`;
    html += `<p class="text-muted">Sin datos de eliminatorias aun (fase de grupos). Casillas "Por definir".</p>`;
    html += `<div class="bracket-container">`;

    ROUND_ORDER.forEach(key => {
        html += `<div class="bracket-round">`;
        html += `<div class="bracket-round-title">${ROUND_LABELS[key]}</div>`;
        const count = getExpectedMatches(key);
        for (let i = 0; i < count; i++) {
            html += `<div class="bracket-match pending">Por definir</div>`;
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
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

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
