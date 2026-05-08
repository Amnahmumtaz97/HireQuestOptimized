import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.hirequest.app',
  appName: 'HireQuest',
  webDir: 'www',
  server: {
    // For production builds, set HQ_MOBILE_SERVER_URL to your hosted Next.js URL.
    // Example: https://app.hirequest.com
    url: process.env.HQ_MOBILE_SERVER_URL,
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
  },
}

export default config

