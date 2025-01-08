import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/App.jsx',
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        react(),
    ],
    server: {
        host: '192.168.0.115',
        //172.20.10.4
        port: 3000,
        // https: {
        //     key: fs.readFileSync(path.resolve('C:/laragon/etc/ssl/laragon.key')), // Path to your SSL key file
        //     cert: fs.readFileSync(path.resolve('C:/laragon/etc/ssl/laragon.crt')), // Path to your SSL certificate
        // },
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
        },
    },
});
