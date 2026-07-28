// ============================================================
// CONFIGURACION
// ============================================================
const API_BASE = '/api';  // Usa el proxy de Vite

// ============================================================
// AUTENTICACION
// ============================================================
const generateSimulatedJWT = (email) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: email,
        iat: now,
        exp: now + 300 // 5 minutos de expiracion
    };
    const headerB64 = btoa(JSON.stringify(header));
    const payloadB64 = btoa(JSON.stringify(payload));
    return `${headerB64}.${payloadB64}.simulated`;
};

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE}/auth/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            // Si la API responde con error HTTP, generamos token simulado
            const token = generateSimulatedJWT(email);
            localStorage.setItem('jwt_token', token);
            return token;
        }

        const data = await response.json();
        const token = data.token || data.access_token || data.jwt;
        if (!token) throw new Error('No se recibio token');
        localStorage.setItem('jwt_token', token);
        return token;

    } catch (error) {
        // Si la API no responde (error de red, CORS, timeout, etc.),
        // generamos un token simulado para permitir el uso offline
        if (error.message === 'No se recibio token') {
            throw error;
        }
        const token = generateSimulatedJWT(email);
        localStorage.setItem('jwt_token', token);
        return token;
    }
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
    const { skipCache = false, ...fetchOptions } = options;

    const token = getToken();
    if (!token) {
        throw new Error('NO_AUTH');
    }

    const url = `${API_BASE}/get/${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...fetchOptions.headers
    };

    let attempt = 0;
    const MAX_ATTEMPTS = 4;
    let waitTime = 1000; // Backoff inicial: 1 segundo

    while (attempt < MAX_ATTEMPTS) {
        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
                signal: fetchOptions.signal
            });

            // 401: Token expirado o invalido — limpiar y notificar al UI
            if (response.status === 401) {
                localStorage.removeItem('jwt_token');
                throw new Error('SESION_EXPIRADA');
            }

            // 429: Limite de tasa — backoff exponencial con countdown visible
            if (response.status === 429) {
                window.dispatchEvent(new CustomEvent('backoff_start', {
                    detail: { waitMs: waitTime, type: 'rate_limit' }
                }));
                // Mostrar countdown visual durante el backoff
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

            // 500+: Error de servidor — backoff SIN countdown visible (silencioso)
            if (response.status >= 500) {
                window.dispatchEvent(new CustomEvent('backoff_start', {
                    detail: { waitMs: waitTime, type: 'server_error' }
                }));
                // Backoff silencioso: solo esperar sin mostrar countdown
                await new Promise(resolve => setTimeout(resolve, waitTime));
                waitTime *= 2;
                attempt++;
                if (attempt >= MAX_ATTEMPTS) break;
                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Exito: guardar en caché (a menos que skipCache este activo)
            const data = await response.json();
            if (!skipCache) {
                saveCache(endpoint, data);
            }
            return { data, isStale: false };

        } catch (error) {
            if (error.name === 'AbortError') throw error;
            if (error.message === 'SESION_EXPIRADA' || error.message === 'NO_AUTH') throw error;

            // Si es el ultimo intento o error de red, intentar usar caché
            if (attempt >= MAX_ATTEMPTS - 1 || error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                if (!skipCache) {
                    const cached = getCache(endpoint);
                    if (cached) {
                        return { data: cached, isStale: true };
                    }
                }
                throw new Error(`No se pudo obtener ${endpoint} y no hay cache`);
            }
            attempt++;
        }
    }

    // Si se agotaron los reintentos, intentar caché (solo si no skipCache)
    if (!skipCache) {
        const cached = getCache(endpoint);
        if (cached) {
            return { data: cached, isStale: true };
        }
    }
    throw new Error(`Fallo total al obtener ${endpoint}`);
};
