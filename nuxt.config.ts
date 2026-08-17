import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-17',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Steyr 680 Nachschlagewerk',
      htmlAttrs: { lang: 'de' },
      meta: [
        // viewport-fit=cover: Inhalt bis unter Notch/Home-Indicator, Abstände via safe-area
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#f2edde' },
        { name: 'description', content: 'Werksunterlagen, Teilenummern, Fehleranalyse und Wartung für Steyr 680 M, 680 M3 und A 680 g' },
        // iOS: als eigenständige App vom Home-Bildschirm starten
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Steyr 680' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/img/icon-192.png' },
        { rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },
  ignore: ['680/**'],
})
