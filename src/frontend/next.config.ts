import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* Only available on the server side */
    serverRuntimeConfig: {

    },

    /* Available on both server and client */
    publicRuntimeConfig: {
        backendApiUrl: 'http://localhost:8080'
    },



};

export default nextConfig;
