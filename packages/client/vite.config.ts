import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA as pwa } from 'vite-plugin-pwa';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { description, name } from '../../package.json';
import config, { type Config } from '../common/config';

let expose = ['name', 'host', 'ssl', 'serverId'] as const;

interface ExposedConfig extends Pick<Config, typeof expose[number]> {
    debug: boolean;
    version: string;
    port: number;
    hub: string | false;
}

declare global {
    interface Window {
        config: ExposedConfig;
    }
}

function loadEnv(isProduction: boolean): ExposedConfig {
    let env = {} as ExposedConfig,
        {
            gver,
            clientRemoteHost,
            clientRemotePort,
            hubEnabled,
            hubHost,
            hubPort,
            host,
            socketioPort,
            ssl
        } = config;

    for (let key of expose) env[key] = config[key] as never;

    let clientHost = clientRemoteHost || (hubEnabled ? hubHost : host),
        clientPort = clientRemotePort || (hubEnabled ? hubPort : socketioPort),
        hub = ssl ? `https://${clientHost}` : `http://${clientHost}:${clientPort}`;

    return Object.assign(env, {
        debug: !isProduction,
        version: gver,
        host: clientHost,
        port: clientPort,
        hub: hubEnabled && hub
    });
}

export default defineConfig(({ mode }) => {
    let isProduction = mode === 'production',
        env = loadEnv(isProduction);

    return {
        plugins: [
            pwa({
                registerType: 'autoUpdate',
                includeAssets: '**/*',
                workbox: { cacheId: name },
                manifest: {
                    name: config.name,
                    short_name: config.name,
                    description,
                    display: 'fullscreen',
                    background_color: '#000000',
                    theme_color: '#000000',
                    icons: [192, 512].map((size) => {
                        let sizes = `${size}x${size}`;

                        return {
                            src: `/img/icons/android-chrome-${sizes}.png`,
                            sizes,
                            type: 'image/png',
                            purpose: 'any maskable'
                        };
                    }),
                    screenshots: [
                        {
                            src: 'screenshot.png',
                            sizes: '750x1334',
                            type: 'image/png'
                        }
                    ],
                    categories: ['entertainment', 'games']
                }
            }),
            legacy(),
            createHtmlPlugin({
                minify: isProduction && { processScripts: ['application/ld+json'] }
            })
        ],
        build: {
            sourcemap: true,
            chunkSizeWarningLimit: 4e3
        },
        server: { port: 9000 },
        define: { 'window.config': env }
    };
});
