#!/usr/bin/env bash
set -e

echo "=== MAFIA AI — NEXUS EDITION (np.made.ammu v6.0.0) Android Release Build ==="

BUILD_DIR="/tmp/mafia_nexus_v600_build"
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

# 1. Launcher icon
if [ -f "public/downloads/ammu-ai-v5.1.0.apk" ]; then
    unzip -p public/downloads/ammu-ai-v5.1.0.apk res/mipmap-hdpi-v4/ic_launcher.png > "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" || true
elif [ -f "public/downloads/ammu-ai-v5.0.2.apk" ]; then
    unzip -p public/downloads/ammu-ai-v5.0.2.apk res/mipmap-hdpi-v4/ic_launcher.png > "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" || true
fi
if [ ! -s "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" ]; then
    python3 -c "import base64; open('$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png', 'wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVGhD7cExAQAAAMKg9U9tCy8gAAAAAAAAAAAAAADAhyU1AAG/5p9uAAAAAElFTkSuQmCC'))"
fi

# 2. String Resources
cat << 'EOF' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MAFIA AI</string>
</resources>
EOF

cat << 'EOF' > "$BUILD_DIR/res/values-ne/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">माफिया एआई</string>
</resources>
EOF

cat << 'EOF' > "$BUILD_DIR/res/values-hi/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">माफिया एआई</string>
</resources>
EOF

# 3. Build web production bundle and copy into APK assets/www
echo "Building web bundle with npm run build..."
npm run build

echo "Copying web production bundle into assets/www..."
cp -r dist/* "$BUILD_DIR/assets/www/"
rm -rf "$BUILD_DIR/assets/www/downloads"
rm -rf "$BUILD_DIR/assets/www/assets/aistudio"

# 4. Create AndroidManifest.xml for NEXUS Edition v6.0.0
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="np.made.ammu"
    android:versionCode="600"
    android:versionName="6.0.0">

    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.flash" android:required="false" />
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

# 5. Create native MainActivity.java with MAFIA NEXUS Native Bridge
cat << 'EOF' > "$BUILD_DIR/src/np/made/ammu/MainActivity.java"
package np.made.ammu;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.provider.MediaStore;
import android.provider.Settings;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private static final String TAG = "MafiaNexus";
    private static final int REQ_PERMISSIONS = 600;
    private static final int REQ_SPEECH = 601;
    private static final int REQ_CAMERA = 602;

    private WebView webView;
    private TextToSpeech tts;
    private boolean isTorchOn = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hardware acceleration for MAFIA Arc Reactor & Agent visualizers
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        tts = new TextToSpeech(this, this);

        webView = new WebView(this);
        setContentView(webView);

        configureWebView();

        checkAndRequestPermissions();

        // Load offline embedded SPA from assets/www
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d(TAG, "[Console] " + cm.message() + " -- From line "
                    + cm.lineNumber() + " of " + cm.sourceId());
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.i(TAG, "MAFIA AI NEXUS Page Loaded: " + url);
                // Auto-configure Cloud Backend URL for seamless remote Gemini AI execution
                view.evaluateJavascript(
                    "(function() {" +
                    "  if (!localStorage.getItem('ammu_custom_backend_url')) {" +
                    "    localStorage.setItem('ammu_custom_backend_url', 'https://ais-dev-n7v43h4odxk3lahirr2f3g-15092862494.asia-southeast1.run.app');" +
                    "  }" +
                    "})();",
                    null
                );
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                Log.e(TAG, "WebView error: " + description + " (" + failingUrl + ")");
            }
        });

        webView.addJavascriptInterface(new MafiaNexusBridge(this), "AndroidBridge");
        webView.addJavascriptInterface(new MafiaNexusBridge(this), "AmmuAndroidBridge");
    }

    private void checkAndRequestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] perms = {
                "android.permission.RECORD_AUDIO",
                "android.permission.CAMERA",
                "android.permission.READ_CONTACTS"
            };
            ArrayList<String> needed = new ArrayList<String>();
            for (String p : perms) {
                if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                    needed.add(p);
                }
            }
            if (!needed.isEmpty()) {
                requestPermissions(needed.toArray(new String[0]), REQ_PERMISSIONS);
            }
        }
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            tts.setLanguage(new Locale("ne", "NP"));
            tts.setSpeechRate(1.0f);
        } else {
            Log.w(TAG, "TTS Init failed");
        }
    }

    public class MafiaNexusBridge {
        private Context ctx;

        public MafiaNexusBridge(Context ctx) {
            this.ctx = ctx;
        }

        @JavascriptInterface
        public String getVersion() {
            return "6.0.0";
        }

        @JavascriptInterface
        public int getVersionCode() {
            return 600;
        }

        @JavascriptInterface
        public String getEdition() {
            return "NEXUS";
        }

        @JavascriptInterface
        public boolean isNative() {
            return true;
        }

        @JavascriptInterface
        public void toggleFlashlight(boolean enable) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    CameraManager cm = (CameraManager) getSystemService(Context.CAMERA_SERVICE);
                    if (cm != null) {
                        String[] list = cm.getCameraIdList();
                        if (list != null && list.length > 0) {
                            cm.setTorchMode(list[0], enable);
                            isTorchOn = enable;
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Torch error: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public int getBatteryLevel() {
            try {
                IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
                Intent b = registerReceiver(null, ifilter);
                if (b != null) {
                    int level = b.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                    int scale = b.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                    return (int) ((level / (float) scale) * 100);
                }
            } catch (Exception e) {
                Log.w(TAG, "Battery read err: " + e.getMessage());
            }
            return 88;
        }

        @JavascriptInterface
        public boolean isBatteryCharging() {
            try {
                IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
                Intent b = registerReceiver(null, ifilter);
                if (b != null) {
                    int status = b.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
                    return status == BatteryManager.BATTERY_STATUS_CHARGING
                        || status == BatteryManager.BATTERY_STATUS_FULL;
                }
            } catch (Exception e) {}
            return false;
        }

        @JavascriptInterface
        public void launchApp(String packageName, String uri) {
            try {
                Intent i = null;
                if (packageName != null && !packageName.isEmpty()) {
                    i = getPackageManager().getLaunchIntentForPackage(packageName);
                }
                if (i == null && uri != null && !uri.isEmpty()) {
                    i = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
                }
                if (i != null) {
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i);
                }
            } catch (Exception e) {
                Log.e(TAG, "Launch error: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public void dialNumber(String phoneNumber) {
            try {
                Intent intent = new Intent(Intent.ACTION_DIAL);
                intent.setData(Uri.parse("tel:" + phoneNumber));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                Log.e(TAG, "Dial error: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public void speakText(String text, String lang) {
            if (tts == null) return;
            try {
                if ("ne".equalsIgnoreCase(lang) || "ne-NP".equalsIgnoreCase(lang)) {
                    tts.setLanguage(new Locale("ne", "NP"));
                } else if ("hi".equalsIgnoreCase(lang) || "hi-IN".equalsIgnoreCase(lang)) {
                    tts.setLanguage(new Locale("hi", "IN"));
                } else {
                    tts.setLanguage(Locale.US);
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "MAFIA_TTS_" + System.currentTimeMillis());
                } else {
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null);
                }
            } catch (Exception e) {
                Log.w(TAG, "TTS speak err: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public void speakNepali(String text) {
            speakText(text, "ne");
        }

        @JavascriptInterface
        public void stopSpeaking() {
            if (tts != null) {
                tts.stop();
            }
        }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
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
javac -source 8 -target 8 -encoding UTF-8 -cp /usr/lib/android-sdk/platforms/android-23/android.jar -d "$BUILD_DIR/classes" "$BUILD_DIR/src/np/made/ammu/MainActivity.java"

# 7. Convert Java Bytecode to Android DEX via dalvik-exchange
echo "Converting bytecode to classes.dex using dalvik-exchange..."
dalvik-exchange --dex --output="$BUILD_DIR/dex/classes.dex" "$BUILD_DIR/classes"

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
    --out "$BUILD_DIR/mafia-ai-v6.0.0.apk" \
    "$BUILD_DIR/aligned.apk"

# 12. Verify Signed APK
echo "Verifying APK signature..."
apksigner verify --verbose "$BUILD_DIR/mafia-ai-v6.0.0.apk"

echo "Verifying APK badging..."
aapt dump badging "$BUILD_DIR/mafia-ai-v6.0.0.apk" | head -n 12

# 13. Copy to deliverable locations
echo "Deploying final APK deliverables..."
mkdir -p /app/applet/public/downloads
mkdir -p "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7"

cp "$BUILD_DIR/mafia-ai-v6.0.0.apk" /app/applet/public/downloads/mafia-ai-v6.0.0.apk
cp "$BUILD_DIR/mafia-ai-v6.0.0.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/mafia-ai-v6.0.0.apk"

# Keep compatibility targets synced
cp "$BUILD_DIR/mafia-ai-v6.0.0.apk" /app/applet/public/downloads/ammu-ai-v5.1.0.apk
cp "$BUILD_DIR/mafia-ai-v6.0.0.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.1.0.apk"
cp "$BUILD_DIR/mafia-ai-v6.0.0.apk" /app/applet/public/downloads/ammu-ai-v5.0.2.apk
cp "$BUILD_DIR/mafia-ai-v6.0.0.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.2.apk"
cp "$BUILD_DIR/mafia-ai-v6.0.0.apk" /app/applet/public/downloads/ammu-ai-v5.0.0.apk
cp "$BUILD_DIR/mafia-ai-v6.0.0.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.0.apk"

# Calculate SHA256
sha256sum "$BUILD_DIR/mafia-ai-v6.0.0.apk" > /app/applet/public/downloads/mafia-ai-v6.0.0.apk.sha256
sha256sum "$BUILD_DIR/mafia-ai-v6.0.0.apk" > "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/mafia-ai-v6.0.0.apk.sha256"

# 14. Upload to tmpfiles.org
echo "Uploading APK to tmpfiles.org..."
TMP_RESPONSE=$(curl -s -F "file=@$BUILD_DIR/mafia-ai-v6.0.0.apk" https://tmpfiles.org/api/v1/upload)
echo "tmpfiles response: $TMP_RESPONSE"
TMP_URL=$(python3 -c "import json, sys; res=json.loads('''$TMP_RESPONSE'''); url=res.get('data', {}).get('url', ''); print(url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/') if url else '')" || true)

if [ -n "$TMP_URL" ]; then
    echo "Direct tmpfiles download link: $TMP_URL"
    echo "$TMP_URL" > /app/applet/public/downloads/tmpfiles_url.txt
    echo "$TMP_URL" > "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/tmpfiles_url.txt"
fi

echo "=== MAFIA AI NEXUS v6.0.0 APK BUILD SUCCESSFUL ==="
ls -lh /app/applet/public/downloads/mafia-ai-v6.0.0.apk
cat /app/applet/public/downloads/mafia-ai-v6.0.0.apk.sha256
