'use client'
// src/utils/backendApiUrl.ts

export const getBackendApiUrl = (): string => {
    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        return `http://${host}:8080`;
    } else {
        // Fallback-Wert, wenn window nicht definiert ist
        return "http://default-host:8080";
    }
};
// src/utils/backendApiUrl.ts



// export const getBackendApiUrl = (): string => {
//     // Diese Funktion geht davon aus, dass sie nur im Client verwendet wird.
//     if (typeof window === "undefined") {
//         throw new Error("getBackendApiUrl darf nur im Client verwendet werden.");
//     }
//     return `http://${window.location.hostname}:8080`;
// };