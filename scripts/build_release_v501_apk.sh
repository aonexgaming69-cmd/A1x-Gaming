#!/usr/bin/env bash
set -e

echo "=== AMMU AI v5.0.1 (np.made.ammu) Real Android Release Build ==="

BUILD_DIR="/tmp/ammu_v501_build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$BUILD_DIR/src/np/made/ammu"
mkdir -p "$BUILD_DIR/classes"
mkdir -p "$BUILD_DIR/dex"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/values-ne"
mkdir -p "$BUILD_DIR/res/values-hi"
mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$BUILD_DIR/assets/www"

# 1. Extract launcher icon
if [ -f "public/downloads/ammu-ai-v5.0.0.apk" ]; then
    unzip -p public/downloads/ammu-ai-v5.0.0.apk res/mipmap-hdpi-v4/ic_launcher.png > "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" || true
fi
if [ ! -s "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" ]; then
    # Create simple 1x1 png or fallback
    python3 -c "import base64; open('$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png', 'wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVGhD7cExAQAAAMKg9U9tCy8gAAAAAAAAAAAAAADAhyU1AAG/5p9uAAAAAElFTkSuQmCC'))"
fi

# 2. Setup Resources
cat << 'EOF' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">AMMU AI</string>
</resources>
EOF

cat << 'EOF' > "$BUILD_DIR/res/values-ne/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">अम्मु एआई</string>
</resources>
EOF

cat << 'EOF' > "$BUILD_DIR/res/values-hi/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">अम्मू एआई</string>
</resources>
EOF

# 3. Copy compiled web assets into APK assets/www
echo "Copying web production assets into assets/www..."
cp -r dist/* "$BUILD_DIR/assets/www/"

# 4. Create AndroidManifest.xml
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="np.made.ammu"
    android:versionCode="501"
    android:versionName="5.0.1">

    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <uses-feature android:name="android.hardware.microphone" android:required="false" />
    <uses-feature android:name="android.hardware.telephony" android:required="false" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:hardwareAccelerated="true"
        android:allowBackup="true"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar">
        
        <activity
            android:name="np.made.ammu.MainActivity"
            android:label="@string/app_name"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# 5. Create native MainActivity.java
cat << 'EOF' > "$BUILD_DIR/src/np/made/ammu/MainActivity.java"
package np.made.ammu;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.util.Locale;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private static final String TAG = "AmmuAI";
    private WebView webView;
    private TextToSpeech tts;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hardware acceleration
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        // Initialize Android Text-to-Speech
        try {
            tts = new TextToSpeech(this, this);
        } catch (Exception e) {
            Log.e(TAG, "TTS init error: " + e.getMessage());
        }

        // Request runtime permissions on Android 6.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(new String[]{
                "android.permission.RECORD_AUDIO",
                "android.permission.READ_CONTACTS",
                "android.permission.CALL_PHONE"
            }, 501);
        }

        // Initialize WebView
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUserAgentString(settings.getUserAgentString() + " AmmuAI/5.0.1 np.made.ammu");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                Log.d(TAG, "Granting WebView permission: " + request.toString());
                request.grant(request.getResources());
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d(TAG, "[Console] " + cm.message() + " (" + cm.sourceId() + ":" + cm.lineNumber() + ")");
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null && url.startsWith("tel:")) {
                    Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                Log.i(TAG, "AMMU AI v5.0.1 Home Screen ready: " + url);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView load error: " + description + " URL: " + failingUrl);
            }
        });

        // Add Native JavaScript Bridge
        webView.addJavascriptInterface(new AmmuNativeBridge(this), "AmmuAndroidBridge");

        // Load complete offline mobile application
        webView.loadUrl("file:///android_asset/www/index.html");

        setContentView(webView);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && tts != null) {
            Locale npLocale = new Locale("ne", "NP");
            int res = tts.setLanguage(npLocale);
            if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts.setLanguage(new Locale("hi", "IN"));
            }
        }
    }

    public class AmmuNativeBridge {
        private final Context ctx;

        public AmmuNativeBridge(Context context) {
            this.ctx = context;
        }

        @JavascriptInterface
        public boolean isNativeAndroid() {
            return true;
        }

        @JavascriptInterface
        public String getVersionName() {
            return "5.0.1";
        }

        @JavascriptInterface
        public int getVersionCode() {
            return 501;
        }

        @JavascriptInterface
        public void makePhoneCall(String phoneNumber) {
            if (phoneNumber == null) return;
            String clean = phoneNumber.replaceAll("[^0-9+*#]", "");
            Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + clean));
            ctx.startActivity(intent);
        }

        @JavascriptInterface
        public void speakNepali(String text) {
            if (tts != null && text != null && !text.isEmpty()) {
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ammu_tts_" + System.currentTimeMillis());
            }
        }

        @JavascriptInterface
        public void showToast(String message) {
            Toast.makeText(ctx, message, Toast.LENGTH_SHORT).show();
        }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            try {
                Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) {
                    v.vibrate(Math.min(durationMs, 1000));
                }
            } catch (Exception e) {
                Log.w(TAG, "Vibrate exception: " + e.getMessage());
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
EOF

# 6. Compile Java to Bytecode
echo "Compiling Java with javac..."
javac -encoding UTF-8 -cp /usr/lib/android-sdk/platforms/android-23/android.jar -d "$BUILD_DIR/classes" "$BUILD_DIR/src/np/made/ammu/MainActivity.java"

# 7. Convert Java Bytecode to Android DEX via D8
echo "Converting bytecode to classes.dex using D8..."
/usr/local/bin/d8 --release --min-api 26 --output "$BUILD_DIR/dex" "$BUILD_DIR/classes/np/made/ammu"/*.class

# 8. Package APK with AAPT
echo "Packaging APK with AAPT..."
cd "$BUILD_DIR"
aapt package -f -m \
    -F "$BUILD_DIR/unsigned.apk" \
    -M "$BUILD_DIR/AndroidManifest.xml" \
    -S "$BUILD_DIR/res" \
    -A "$BUILD_DIR/assets" \
    -I /usr/lib/android-sdk/platforms/android-23/android.jar

# 9. Add classes.dex into APK
echo "Adding classes.dex into APK..."
cd "$BUILD_DIR/dex"
aapt add "$BUILD_DIR/unsigned.apk" classes.dex

# 10. 4-byte zipalign
echo "Aligning APK with zipalign..."
zipalign -f -v 4 "$BUILD_DIR/unsigned.apk" "$BUILD_DIR/aligned.apk"

# 11. Sign APK with Release Keystore
echo "Signing APK with apksigner using Release Keystore..."
apksigner sign \
    --ks /root/ammu_release.keystore \
    --ks-key-alias ammurelease \
    --ks-pass pass:ammuai2026 \
    --key-pass pass:ammuai2026 \
    --out "$BUILD_DIR/ammu-ai-v5.0.1.apk" \
    "$BUILD_DIR/aligned.apk"

# 12. Verify Signed APK
echo "Verifying APK signature..."
apksigner verify --verbose "$BUILD_DIR/ammu-ai-v5.0.1.apk"

echo "Verifying APK badging..."
aapt dump badging "$BUILD_DIR/ammu-ai-v5.0.1.apk" | head -n 12

# 13. Copy to deliverable locations
echo "Deploying final APK deliverables..."
mkdir -p /app/applet/public/downloads
mkdir -p "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7"

cp "$BUILD_DIR/ammu-ai-v5.0.1.apk" /app/applet/public/downloads/ammu-ai-v5.0.1.apk
cp "$BUILD_DIR/ammu-ai-v5.0.1.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.1.apk"

# Also update v5.0.0 copy so old links continue to work with fixed binary
cp "$BUILD_DIR/ammu-ai-v5.0.1.apk" /app/applet/public/downloads/ammu-ai-v5.0.0.apk
cp "$BUILD_DIR/ammu-ai-v5.0.1.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.0.apk"

# Calculate SHA256
sha256sum "$BUILD_DIR/ammu-ai-v5.0.1.apk" > /app/applet/public/downloads/ammu-ai-v5.0.1.apk.sha256
sha256sum "$BUILD_DIR/ammu-ai-v5.0.1.apk" > "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.1.apk.sha256"

echo "=== AMMU AI v5.0.1 APK BUILD SUCCESSFUL ==="
ls -lh /app/applet/public/downloads/ammu-ai-v5.0.1.apk
cat /app/applet/public/downloads/ammu-ai-v5.0.1.apk.sha256
