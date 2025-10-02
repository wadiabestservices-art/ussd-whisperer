import { Capacitor } from '@capacitor/core';

/**
 * USSD Plugin for Android
 * This plugin provides native USSD dialing functionality
 */
export interface UssdPlugin {
  /**
   * Execute a USSD code on Android device
   * @param options - The USSD code to execute
   * @returns Promise with the result
   */
  dial(options: { code: string }): Promise<{ result: string }>;
}

/**
 * Check if we're running on a native Android platform
 */
export const isNativeAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform();
};

/**
 * Execute USSD code
 * On Android: Will use native dialer
 * On Web: Will simulate the execution
 */
export const executeUssdCode = async (code: string): Promise<string> => {
  if (isNativeAndroid()) {
    try {
      // On Android, open the native dialer with the USSD code
      // The actual implementation would require a native Android plugin
      // For now, we'll use the tel: URI scheme which Android supports
      window.open(`tel:${encodeURIComponent(code)}`, '_system');
      return 'USSD code sent to native dialer';
    } catch (error) {
      console.error('Failed to execute USSD code:', error);
      throw new Error('Failed to execute USSD code on native platform');
    }
  } else {
    // Web simulation
    return 'USSD execution simulated (web environment)';
  }
};

/**
 * Request phone permissions (required for Android)
 */
export const requestPhonePermissions = async (): Promise<boolean> => {
  if (isNativeAndroid()) {
    // On Android, permissions are declared in AndroidManifest.xml
    // and handled by the Capacitor permissions API
    return true;
  }
  return true;
};
