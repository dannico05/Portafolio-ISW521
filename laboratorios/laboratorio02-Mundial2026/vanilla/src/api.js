// ============================================================
// CONFIGURACIÓN
// ============================================================
const API_BASE = '/api';  // Usa el proxy de Vite

// ============================================================
// AUTENTICACIÓN
// ============================================================
export const login = async (email, password) => {
    console.log('Intentando login con:', { email, password }); // Para depuración
    const response = await fetch(`${API_BASE}/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.error) errorMessage = errorData.error;
        } catch {
            const text = await response.text();
            if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const token = data.token || data.access_token || data.jwt;
    if (!token) throw new Error('No se recibió token');
    localStorage.setItem('jwt_token', token);
    return token;
};

export const logout = () => {
    localStorage.removeItem('jwt_token');
};

export const getToken = () => {
    return localStorage.getItem('jwt_token');
};

// ============================================================
// CACHÉ EN LOCALSTORAGE
// ============================================================
const saveCache = (key, data) => {
    localStorage.setItem(`cache_${key}`, JSON.stringify(data));
};

const getCache = (key) => {
    const raw = localStorage.getItem(`cache_${key}`);
    return raw ? JSON.parse(raw) : null;
};

// ============================================================
// CLIENTE API RESILIENTE
// ============================================================
export const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    if (!token) {
        throw new Error('NO_AUTH');
    }

    const url = `${API_BASE}/get/${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    let attempt = 0;
    const MAX_ATTEMPTS = 4;
    let waitTime = 1000;

    while (attempt < MAX_ATTEMPTS) {
        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: options.signal
            });

            if (response.status === 401) {
                localStorage.removeItem('jwt_token');
                throw new Error('SESION_EXPIRADA');
            }

            if (response.status === 429) {
                for (let i = Math.floor(waitTime / 1000); i > 0; i--) {
                    window.dispatchEvent(new CustomEvent('countdown', {
                        detail: { seconds: i, type: 'rate_limit' }
                    }));
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                window.dispatchEvent(new CustomEvent('countdown', {
                    detail: { seconds: 0, type: 'rate_limit' }
                }));
                waitTime *= 2;
                attempt++;
                if (attempt >= MAX_ATTEMPTS) break;
                continue;
            }

            if (response.status >= 500) {
                for (let i = Math.floor(waitTime / 1000); i > 0; i--) {
                    window.dispatchEvent(new CustomEvent('countdown', {
                        detail: { seconds: i, type: 'server_error' }
                    }));
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                window.dispatchEvent(new CustomEvent('countdown', {
                    detail: { seconds: 0, type: 'server_error' }
                }));
                waitTime *= 2;
                attempt++;
                if (attempt >= MAX_ATTEMPTS) break;
                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            saveCache(endpoint, data);
            return { data, isStale: false };

        } catch (error) {
            if (error.name === 'AbortError') throw error;
            if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') throw error;

            if (attempt >= MAX_ATTEMPTS - 1 || error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                const cached = getCache(endpoint);
                if (cached) {
                    return { data: cached, isStale: true };
                }
                throw new Error(`No se pudo obtener ${endpoint} y no hay caché`);
            }
            attempt++;
        }
    }

    const cached = getCache(endpoint);
    if (cached) {
        return { data: cached, isStale: true };
    }
    throw new Error(`Fallo total al obtener ${endpoint}`);
};