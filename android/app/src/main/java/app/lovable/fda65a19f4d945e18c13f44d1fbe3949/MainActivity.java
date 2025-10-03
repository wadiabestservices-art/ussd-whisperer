package app.lovable.fda65a19f4d945e18c13f44d1fbe3949;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Register the USSD plugin
    registerPlugin(UssdPlugin.class);
  }
}
