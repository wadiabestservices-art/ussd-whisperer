# USSD Whisperer - Multi-Level USSD Code Executor

An Android app for executing and automating multi-level USSD codes with native capabilities.

## Features

- ✨ Multi-level USSD code execution with step-by-step processing
- 📱 Native Android app with phone permissions
- 🔄 Automatic execution of pending USSD codes
- 💾 Database storage for USSD codes and results
- 📊 Real-time status updates and execution tracking
- 🎯 10 pre-configured multi-level USSD codes

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Mobile**: Capacitor (Android)
- **Database**: PostgreSQL with real-time subscriptions

## Getting Started

### Running in Lovable

The app runs automatically in the Lovable preview environment.

### Building for Android

To run this app natively on an Android device:

1. **Export to GitHub**
   - Click "Export to Github" button in Lovable
   - Clone your repository locally

2. **Install Dependencies**
   ```bash
   git clone <YOUR_GIT_URL>
   cd ussd-whisperer
   npm install
   ```

3. **Add Android Platform**
   ```bash
   npx cap add android
   ```

4. **Update Android Platform**
   ```bash
   npx cap update android
   ```

5. **Build the Web Assets**
   ```bash
   npm run build
   ```

6. **Sync Capacitor**
   ```bash
   npx cap sync android
   ```

7. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

8. **Run on Device/Emulator**
   - Connect your Android device or start an emulator
   - Click "Run" in Android Studio
   - Or use: `npx cap run android`

### Required Permissions

The app requires the following Android permissions:
- `CALL_PHONE` - To execute USSD codes
- `READ_PHONE_STATE` - To monitor USSD execution
- `PROCESS_OUTGOING_CALLS` - To intercept USSD results
- `INTERNET` - For database synchronization

## Multi-Level USSD Codes

The app supports complex multi-level USSD workflows:

### Example Multi-Level Flow
```json
{
  "name": "Bank Transfer",
  "code": "*121*1#",
  "levels": [
    {"step": 1, "prompt": "Select bank from list", "code": "*121*1#"},
    {"step": 2, "prompt": "Enter account number", "code": "*121*1*{input}#"},
    {"step": 3, "prompt": "Enter amount", "code": "*121*1*{input}*{input2}#"},
    {"step": 4, "prompt": "Enter PIN", "code": "*121*1*{input}*{input2}*{input3}#"}
  ]
}
```

## Pre-configured USSD Codes

The app comes with 10 multi-level USSD codes:
1. Check Balance - Multi Step
2. Mobile Data Bundle
3. Airtime Transfer
4. Bill Payment
5. Bank Transfer
6. Loan Request
7. Recharge Card
8. Check Transaction History
9. Mobile Insurance
10. Service Activation

## Database Schema

### ussd_codes Table
- `id` (uuid) - Primary key
- `name` (text) - USSD code name
- `code` (text) - USSD code string
- `description` (text) - Description
- `status` (text) - pending | running | success | error
- `levels` (jsonb) - Multi-level steps
- `current_level` (integer) - Current execution step
- `session_data` (jsonb) - Session variables
- `last_executed_at` (timestamp) - Last execution time
- `last_result` (text) - Last execution result

## Auto-Execution

The app automatically executes pending USSD codes:
- Checks for pending codes on app load
- Executes each code with 3-second intervals
- Processes multi-level flows step by step
- Updates status in real-time

## Development

### Hot Reload (Development)

For development with hot reload:

1. Update `capacitor.config.ts` with your local IP:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:5173',
     cleartext: true
   }
   ```

2. Run dev server:
   ```bash
   npm run dev
   ```

3. Sync and run:
   ```bash
   npx cap sync android
   npx cap run android
   ```

### Production Build

For production (using deployed URL):

```typescript
server: {
  url: 'https://your-app.lovable.app',
  cleartext: true
}
```

## Troubleshooting

### USSD Not Executing on Android
- Ensure CALL_PHONE permission is granted
- Check that your device supports USSD codes
- Verify network connection

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `npx cap sync android --force`
- Rebuild: `npm run build && npx cap sync android`

### Permissions Denied
- Manually grant permissions in Android Settings > Apps > USSD Whisperer > Permissions

## Project Info

**Lovable Project URL**: https://lovable.dev/projects/fda65a19-f4d9-45e1-8c13-f44d1fbe3949

## Learn More

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Cloud Documentation](https://docs.lovable.dev/features/cloud)
- [Android USSD Documentation](https://developer.android.com/reference/android/telephony/TelephonyManager)
- [Lovable Mobile Development Guide](https://lovable.dev/blogs/TODO)

## License

MIT
