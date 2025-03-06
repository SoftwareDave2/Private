// src/utils/backendApiUrl.ts
export const getBackendApiUrl = (): string => {
    const host = window.location.hostname;
    return `http://${host}:8080`;
};