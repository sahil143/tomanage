module.exports = {
  expo: {
    name: 'toManage',
    slug: 'tomanage',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'tomanage',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.tomanageorg.tomanage',
      associatedDomains: ['applinks:tomanage.app'],
    },
    android: {
      package: 'com.tomanageorg.tomanage',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'tomanage',
              host: 'oauth',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '25adf2a4-d07d-4b97-86dd-2a82655834df',
      },
      // Environment variables
      anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
      ticktickClientId: process.env.EXPO_PUBLIC_TICKTICK_CLIENT_ID,
      ticktickClientSecret: process.env.EXPO_PUBLIC_TICKTICK_CLIENT_SECRET,
      proxyBaseUrl: process.env.EXPO_PUBLIC_PROXY_BASE_URL || 'http://localhost:3001',
    },
    owner: 'tomanageorg',
  },
};
