import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fda65a19f4d945e18c13f44d1fbe3949',
  appName: 'ussd-whisperer',
  webDir: 'dist',
  android: {
    permissions: [
      'android.permission.CALL_PHONE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.PROCESS_OUTGOING_CALLS'
    ]
  }
};

export default config;
