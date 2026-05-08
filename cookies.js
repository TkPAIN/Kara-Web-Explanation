/**
 * ================================================================
 * SISTEMA DE CONSENTIMIENTO DE COOKIES — Kara Tech
 * Compatible con RGPD / GDPR
 * ================================================================
 *
 * Funcionalidades:
 *  - Banner de cookies con 3 opciones (Aceptar, Rechazar, Configurar)
 *  - Panel de configuración por categorías
 *  - Bloqueo de scripts hasta obtener consentimiento
 *  - Botón flotante para reabrir configuración
 *  - Guardado en localStorage
 *  - Animaciones suaves
 *
 * Uso:
 *  1. Registra tus scripts con registerScript(url, category)
 *  2. El sistema los cargará automáticamente si hay consentimiento
 *  3. Llama a initCookieSystem() al cargar la página
 * ================================================================
 */

// ─── CONFIGURACIÓN ──────────────────────────────────────────────
const COOKIE_STORAGE_KEY = 'kara_tech_cookie_consent';
const COOKIE_EXPIRY_DAYS = 365;

// Categorías disponibles
const CATEGORIES = {
    necessary: 'necessary',
    analytics: 'analytics',
    marketing: 'marketing'
};

// ─── COLA DE SCRIPTS PENDIENTES ─────────────────────────────────
// Aquí se registran los scripts que necesitan consentimiento.
// Cada elemento es un objeto: { src: string, category: string }
const pendingScripts = [];

/**
 * Registra un script externo para que se cargue solo si hay consentimiento
 * para la categoría indicada.
 *
 * @param {string} src      - URL del script (ej: https://www.googletagmanager.com/gtag/js?id=G-XXXX)
 * @param {string} category - Categoría ('necessary', 'analytics', 'marketing')
 *
 * Ejemplo:
 *   registerScript(
 *     'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX',
 *     CATEGORIES.analytics
 *   );
 */
function registerScript(src, category) {
    pendingScripts.push({ src, category });
}

/**
 * Carga un script en el DOM de forma dinámica.
 * @param {string} src - URL del script
 * @returns {Promise}  - Se resuelve cuando el script carga
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Evitar duplicados
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Carga todos los scripts registrados que coincidan con las categorías consentidas.
 * @param {string[]} allowedCategories - Lista de categorías permitidas
 */
async function loadConsentedScripts(allowedCategories) {
    for (const entry of pendingScripts) {
        if (allowedCategories.includes(entry.category)) {
            try {
                await loadScript(entry.src);
                console.log(`[Cookies] Script cargado (${entry.category}): ${entry.src}`);
            } catch (e) {
                console.warn(`[Cookies] Error al cargar script (${entry.category}): ${entry.src}`, e);
            }
        }
    }
}

// ─── GESTIÓN DEL CONSENTIMIENTO ─────────────────────────────────

/**
 * Obtiene el consentimiento almacenado.
 * @returns {object|null} - { necessary: true, analytics: boolean, marketing: boolean } o null
 */
function getStoredConsent() {
    try {
        const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}

/**
 * Guarda el consentimiento en localStorage.
 * @param {object} consent - Objeto con las categorías y sus valores booleanos
 */
function saveConsent(consent) {
    try {
        localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {
        console.warn('[Cookies] No se pudo guardar el consentimiento en localStorage.');
    }
}

/**
 * Acepta todas las categorías.
 */
function acceptAllCookies() {
    const consent = {
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: Date.now()
    };
    saveConsent(consent);
    hideBanner();
    hideSettingsPanel();
    showFloatingButton();
    applyConsent(consent);
}

/**
 * Rechaza todas las cookies no esenciales.
 */
function rejectAllCookies() {
    const consent = {
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: Date.now()
    };
    saveConsent(consent);
    hideBanner();
    hideSettingsPanel();
    showFloatingButton();
    applyConsent(consent);
}

/**
 * Guarda las preferencias personalizadas desde el panel de configuración.
 */
function saveCookieSettings() {
    const analyticsChecked = document.getElementById('cookie-cat-analytics').checked;
    const marketingChecked = document.getElementById('cookie-cat-marketing').checked;

    const consent = {
        necessary: true,
        analytics: analyticsChecked,
        marketing: marketingChecked,
        timestamp: Date.now()
    };
    saveConsent(consent);
    hideBanner();
    hideSettingsPanel();
    showFloatingButton();
    applyConsent(consent);
}

/**
 * Aplica el consentimiento: carga los scripts correspondientes.
 * @param {object} consent
 */
function applyConsent(consent) {
    const allowed = [];
    if (consent.necessary) allowed.push(CATEGORIES.necessary);
    if (consent.analytics) allowed.push(CATEGORIES.analytics);
    if (consent.marketing) allowed.push(CATEGORIES.marketing);
    loadConsentedScripts(allowed);
}

// ─── UI: MOSTRAR / OCULTAR ELEMENTOS ───────────────────────────

function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    banner.classList.add('hidden');
    banner.setAttribute('aria-hidden', 'true');
}

function showBanner() {
    const banner = document.getElementById('cookie-banner');
    banner.classList.remove('hidden');
    banner.setAttribute('aria-hidden', 'false');
}

function hideSettingsPanel() {
    const overlay = document.getElementById('cookie-settings-overlay');
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
}

function openCookieSettings() {
    const overlay = document.getElementById('cookie-settings-overlay');
    // Sincronizar los checkboxes con el consentimiento guardado
    const consent = getStoredConsent();
    if (consent) {
        document.getElementById('cookie-cat-analytics').checked = consent.analytics;
        document.getElementById('cookie-cat-marketing').checked = consent.marketing;
    }
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
}

function closeCookieSettings() {
    hideSettingsPanel();
    // Si no hay consentimiento previo, volver a mostrar el banner
    if (!getStoredConsent()) {
        showBanner();
    }
}

function showFloatingButton() {
    const btn = document.getElementById('cookie-floating-btn');
    btn.style.display = 'flex';
}

// ─── INICIALIZACIÓN ─────────────────────────────────────────────

/**
 * Inicializa todo el sistema de cookies.
 * Debe llamarse al cargar la página (DOMContentLoaded).
 */
function initCookieSystem() {
    const consent = getStoredConsent();

    if (consent) {
        // Ya hay consentimiento: aplicar y mostrar botón flotante
        hideBanner();
        hideSettingsPanel();
        showFloatingButton();
        applyConsent(consent);
    } else {
        // No hay consentimiento: mostrar banner
        showBanner();
        hideSettingsPanel();
        // No cargar nada aún (solo las necesarias, que no requieren script externo)
    }

    // Cerrar el panel de configuración si se hace clic fuera
    document.getElementById('cookie-settings-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCookieSettings();
        }
    });
}

// ─── BORRAR CONSENTIMIENTO (para pruebas) ───────────────────────
// Ejecuta en la consola del navegador:  clearCookieConsent()
function clearCookieConsent() {
    localStorage.removeItem(COOKIE_STORAGE_KEY);
    location.reload();
}
// Exponerla globalmente para poder llamarla desde la consola
window.clearCookieConsent = clearCookieConsent;

// ─── ARRANQUE AUTOMÁTICO ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', initCookieSystem);

// ================================================================
// EJEMPLO: Registrar scripts de terceros
// ================================================================
// Descomenta y ajusta las URLs según tus necesidades:

// Google Analytics (GA4)
// registerScript(
//     'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX',
//     CATEGORIES.analytics
// );

// Facebook Pixel
// registerScript(
//     'https://connect.facebook.net/en_US/fbevents.js',
//     CATEGORIES.marketing
// );

// ================================================================
// NOTA SOBRE GOOGLE ANALYTICS:
// Además de cargar el script, necesitas inicializarlo.
// Puedes hacerlo así dentro de registerScript o en una función aparte
// que solo se ejecute si analytics está consentido.
//
// Ejemplo de inicialización segura:
//
// function initGoogleAnalytics(id) {
//     if (!getStoredConsent()?.analytics) return;
//     window.dataLayer = window.dataLayer || [];
//     function gtag(){dataLayer.push(arguments);}
//     gtag('js', new Date());
//     gtag('config', id);
// }
//
// registerScript('https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX', CATEGORIES.analytics);
// // Después de que el script cargue, llamar a initGoogleAnalytics('G-XXXXXXXXXX')
// ================================================================