package app.lovable.fda65a19f4d945e18c13f44d1fbe3949;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.telephony.TelephonyManager;
import android.telephony.SubscriptionManager;
import androidx.core.app.ActivityCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "Ussd",
    permissions = {
        @Permission(strings = { Manifest.permission.CALL_PHONE }, alias = "call"),
        @Permission(strings = { Manifest.permission.READ_PHONE_STATE }, alias = "phoneState")
    }
)
public class UssdPlugin extends Plugin {

    @PluginMethod
    public void executeUssd(PluginCall call) {
        String code = call.getString("code");
        
        if (code == null || code.isEmpty()) {
            call.reject("USSD code is required");
            return;
        }

        // Check permissions
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.CALL_PHONE) 
            != PackageManager.PERMISSION_GRANTED) {
            call.reject("CALL_PHONE permission not granted");
            return;
        }

        try {
            // Execute USSD using TelephonyManager API for Android 8.0+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                executeMarshmallowUssd(code, call);
            } else {
                // Fallback to dial intent for older versions
                executeDialIntent(code, call);
            }
        } catch (Exception e) {
            call.reject("Failed to execute USSD: " + e.getMessage());
        }
    }

    @PluginMethod
    public void executeMultiLevelUssd(PluginCall call) {
        JSArray levels = call.getArray("levels");
        
        if (levels == null || levels.length() == 0) {
            call.reject("Levels array is required");
            return;
        }

        // Check permissions
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.CALL_PHONE) 
            != PackageManager.PERMISSION_GRANTED) {
            call.reject("CALL_PHONE permission not granted");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            executeMultiLevelUssdModern(levels, call);
        } else {
            call.reject("Multi-level USSD requires Android 8.0 or higher");
        }
    }

    private void executeMultiLevelUssdModern(JSArray levels, PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            TelephonyManager telephonyManager = (TelephonyManager) getContext()
                .getSystemService(Context.TELEPHONY_SERVICE);
            
            if (telephonyManager == null) {
                call.reject("TelephonyManager not available");
                return;
            }

            try {
                JSONObject firstLevel = levels.getJSONObject(0);
                String firstCode = firstLevel.getString("code");
                
                JSArray responses = new JSArray();
                final int[] currentLevelIndex = {0};
                
                telephonyManager.sendUssdRequest(firstCode, 
                    new TelephonyManager.UssdResponseCallback() {
                        @Override
                        public void onReceiveUssdResponse(TelephonyManager tm, 
                            String request, CharSequence response) {
                            try {
                                responses.put(response.toString());
                                currentLevelIndex[0]++;
                                
                                // If there are more levels, send the next response
                                if (currentLevelIndex[0] < levels.length()) {
                                    JSONObject nextLevel = levels.getJSONObject(currentLevelIndex[0]);
                                    String nextCode = nextLevel.getString("code");
                                    
                                    // Continue the USSD session with next code
                                    tm.sendUssdRequest(nextCode, this, null);
                                } else {
                                    // All levels complete
                                    JSObject result = new JSObject();
                                    result.put("success", true);
                                    result.put("responses", responses);
                                    call.resolve(result);
                                }
                            } catch (Exception e) {
                                call.reject("Error processing USSD level: " + e.getMessage());
                            }
                        }

                        @Override
                        public void onReceiveUssdResponseFailed(TelephonyManager tm, 
                            String request, int failureCode) {
                            JSObject result = new JSObject();
                            result.put("success", false);
                            result.put("responses", responses);
                            call.reject("USSD failed at level " + (currentLevelIndex[0] + 1) + 
                                " with code: " + failureCode);
                        }
                    }, null);
                    
            } catch (Exception e) {
                call.reject("Failed to start multi-level USSD: " + e.getMessage());
            }
        }
    }

    private void executeMarshmallowUssd(String code, PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            TelephonyManager telephonyManager = (TelephonyManager) getContext()
                .getSystemService(Context.TELEPHONY_SERVICE);
            
            if (telephonyManager != null) {
                if (ActivityCompat.checkSelfPermission(getContext(), 
                    Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                    
                    telephonyManager.sendUssdRequest(code, 
                        new TelephonyManager.UssdResponseCallback() {
                            @Override
                            public void onReceiveUssdResponse(TelephonyManager telephonyManager, 
                                String request, CharSequence response) {
                                JSObject result = new JSObject();
                                result.put("success", true);
                                result.put("response", response.toString());
                                call.resolve(result);
                            }

                            @Override
                            public void onReceiveUssdResponseFailed(TelephonyManager telephonyManager, 
                                String request, int failureCode) {
                                call.reject("USSD request failed with code: " + failureCode);
                            }
                        }, null);
                } else {
                    call.reject("CALL_PHONE permission not granted");
                }
            } else {
                call.reject("TelephonyManager not available");
            }
        } else {
            executeDialIntent(code, call);
        }
    }

    private void executeDialIntent(String code, PluginCall call) {
        try {
            String encodedCode = Uri.encode(code);
            android.content.Intent intent = new android.content.Intent(
                android.content.Intent.ACTION_CALL);
            intent.setData(Uri.parse("tel:" + encodedCode));
            
            if (ActivityCompat.checkSelfPermission(getContext(), 
                Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                getActivity().startActivity(intent);
                
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("response", "USSD code sent to dialer");
                call.resolve(result);
            } else {
                call.reject("CALL_PHONE permission not granted");
            }
        } catch (Exception e) {
            call.reject("Failed to execute USSD via dial intent: " + e.getMessage());
        }
    }

}
