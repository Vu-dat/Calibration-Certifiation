/* Keep the browser's cached identity in sync with the HttpOnly server session. */
(function installApiAuthInterceptor() {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
    if (window.__labmasterAuthInterceptorInstalled) return;
    window.__labmasterAuthInterceptorInstalled = true;

    const nativeFetch = window.fetch.bind(window);
    let redirectingToLogin = false;

    window.fetch = async function(input, init) {
        const rawUrl = typeof input === 'string' || input instanceof URL
            ? String(input)
            : (input && input.url) || '';
        let url;
        try {
            url = new URL(rawUrl, window.location.href);
        } catch (_) {
            return nativeFetch(input, init);
        }

        const isApiRequest = url.origin === window.location.origin
            && (url.pathname === '/api' || url.pathname.startsWith('/api/'));
        if (!isApiRequest) return nativeFetch(input, init);

        const requestInit = Object.assign({}, init || {}, { credentials: 'same-origin' });
        const response = await nativeFetch(input, requestInit);
        const authPath = url.pathname.replace(/\/+$/, '');
        const isPublicAuthEndpoint = authPath === '/api/auth/login' || authPath === '/api/auth/register';

        if (response.status === 401 && !isPublicAuthEndpoint && !redirectingToLogin) {
            redirectingToLogin = true;
            try { window.localStorage.removeItem('labmaster_user'); } catch (_) { /* storage may be blocked */ }
            if (url.pathname !== '/login.html') window.location.replace('/login.html');
        }
        return response;
    };
})();
