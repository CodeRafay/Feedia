import axios from 'axios';

const SENSITIVE_HEADERS = ['Authorization', 'X-API-Key', 'X-Api-Key', 'x-api-key'];

// Ensure we only use http(s) origins and normalize trailing slashes.
const getSafeBaseUrl = () => {
    const candidate = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    try {
        const parsed = new URL(candidate);
        if (!parsed.protocol.startsWith('http')) {
            throw new Error('Invalid protocol');
        }
        return parsed.toString().replace(/\/+$/, '');
    } catch {
        return 'http://localhost:5000';
    }
};

export const API_BASE_URL = getSafeBaseUrl();
export const API_ORIGIN = new URL(API_BASE_URL).origin;

export const stripSensitiveHeaders = (headers) => {
    if (!headers) {
        return;
    }

    if (typeof headers.delete === 'function') {
        SENSITIVE_HEADERS.forEach((key) => headers.delete(key));
        return;
    }

    SENSITIVE_HEADERS.forEach((key) => {
        if (key in headers) {
            delete headers[key];
        }
    });
};

export const configureAxiosSecurity = (client = axios) => {
    // Enforce no automatic redirects and strip auth-like headers on any cross-origin redirect attempt.
    client.defaults.baseURL = API_BASE_URL;
    client.defaults.maxRedirects = 0;

    const requestInterceptor = client.interceptors.request.use(
        (config) => {
            try {
                const target = new URL(config.url, config.baseURL || API_BASE_URL);
                if (target.origin !== API_ORIGIN) {
                    stripSensitiveHeaders(config.headers);
                }
            } catch {
                // Ignore malformed URLs and allow request to proceed
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    const responseInterceptor = client.interceptors.response.use(
        (response) => {
            const finalUrl = response?.request?.responseURL;
            if (finalUrl) {
                try {
                    const responseOrigin = new URL(finalUrl).origin;
                    if (responseOrigin !== API_ORIGIN) {
                        stripSensitiveHeaders(client.defaults.headers.common);
                    }
                } catch {
                    // Ignore URL parse errors
                }
            }
            return response;
        },
        (error) => {
            const redirectUrl = error?.response?.headers?.location;
            if (redirectUrl) {
                try {
                    const redirectOrigin = new URL(redirectUrl, API_BASE_URL).origin;
                    if (redirectOrigin !== API_ORIGIN) {
                        stripSensitiveHeaders(client.defaults.headers.common);
                    }
                } catch {
                    // Ignore URL parse errors
                }
            }
            return Promise.reject(error);
        }
    );

    return { requestInterceptor, responseInterceptor };
};
