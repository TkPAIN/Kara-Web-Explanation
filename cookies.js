/**
 * ================================================================
 * SISTEMA DE CONSENTIMIENTO DE COOKIES — Kara Tech
 * Compatible con RGPD / GDPR
 * ================================================================
 */

const COOKIE_STORAGE_KEY = 'kara_tech_cookie_consent';
const CATEGORIES = {
    necessary: 'necessary',
    analytics: 'analytics',
    marketing: 'marketing'
};

const pendingScripts = [];

function registerScript(src, category) {
    pendingScripts.push({ src, category });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
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

async function loadConsentedScripts(allowedCategories) {
    for (const entry of pendingScripts) {
        if (allowedCategories.includes(entry.category)) {
            try {
                await loadScript(entry.src);
                console.log(`[Cookies] Script cargado (${entry.category}): ${entry.src}`);
            } catch (e) {
                console.warn(`[Cookies] Error al cargar script: ${entry.src}`, e);
            }
        }
    }
}

function getStoredConsent() {
    try {
        const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
}

function saveConsent(consent) {
    try {
        localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {
        console.warn('[Cookies] No se pudo guardar el consentimiento.');
    }
}

function acceptAllCookies() {
    const consent = { necessary: true, analytics: true, marketing: true, timestamp: Date.now() };
    saveConsent(consent);
    hideBanner();
    hideSettingsPanel();
    showFloatingButton();
    applyConsent(consent);
}

function rejectAllCookies() {
    const consent = { necessary: true, analytics: false, marketing: false, timestamp: Date.now() };
    saveConsent(consent);
    hideBanner();
    hideSettingsPanel();
    showFloatingButton();
    applyConsent(consent);
}

function saveCookieSettings() {
    const analyticsChecked = document.getElementById('cookie-cat-analytics').checked;
    const marketingChecked = document.getElementById('cookie-cat-marketing').checked;
    const consent = { necessary: true, analytics: analyticsChecked, marketing: marketingChecked, timestamp: Date.now() };
    saveConsent(consent);
    hideBanner();
    hideSettingsPanel();
    showFloatingButton();
    applyConsent(consent);
}

function applyConsent(consent) {
    const allowed = [];
    if (consent.necessary) allowed.push(CATEGORIES.necessary);
    if (consent.analytics) allowed.push(CATEGORIES.analytics);
    if (consent.marketing) allowed.push(CATEGORIES.marketing);
    loadConsentedScripts(allowed);
}

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
    if (!getStoredConsent()) {
        showBanner();
    }
}

function showFloatingButton() {
    const btn = document.getElementById('cookie-floating-btn');
    btn.style.display = 'flex';
}

function initCookieSystem() {
    const consent = getStoredConsent();
    if (consent) {
        hideBanner();
        hideSettingsPanel();
        showFloatingButton();
        applyConsent(consent);
    } else {
        showBanner();
        hideSettingsPanel();
    }
    document.getElementById('cookie-settings-overlay').addEventListener('click', function(e) {
        if (e.target === this) closeCookieSettings();
    });
}

function clearCookieConsent() {
    localStorage.removeItem(COOKIE_STORAGE_KEY);
    location.reload();
}
window.clearCookieConsent = clearCookieConsent;

document.addEventListener('DOMContentLoaded', initCookieSystem);

// ================================================================
// Registrar aquí tus scripts de terceros (descomenta y personaliza)
// ================================================================
// registerScript('https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX', CATEGORIES.analytics);
// registerScript('https://connect.facebook.net/en_US/fbevents.js', CATEGORIES.marketing);