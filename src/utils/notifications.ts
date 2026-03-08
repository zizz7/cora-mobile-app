import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Android Push Notifications were removed from Expo Go SDK 53
    // We check if it's Expo Go dynamically to avoid crashing
    const isExpoGo = Constants.appOwnership === 'expo';

    if (Platform.OS === 'android' && isExpoGo) {
      console.log('Push notifications disabled in Android Expo Go (SDK 53 constraint).');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // Use EAS projectId from app.json if available; silently skip if not configured
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (error) {
    // Silently fail — push notifications are optional and may not work in dev builds
    console.log('Failed to get push token:', error);
    return null;
  }
}

export async function registerDeviceToken(token: string) {
  try {
    await api.post('/device-token', { token, platform: Platform.OS });
  } catch (e) {
    console.error('Failed to register device token', e);
  }
}

export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    onNotificationReceived?.(notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    onNotificationResponse?.(response);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
