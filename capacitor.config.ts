import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fda65a19f4d945e18c13f44d1fbe3949',
  appName: 'ussd-whisperer',
  webDir: 'dist',
  server: {
    url: 'https://fda65a19-f4d9-45e1-8c13-f44d1fbe3949.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    permissions: [
      'android.permission.CALL_PHONE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.PROCESS_OUTGOING_CALLS'
    ]
  }
};

export default config;
