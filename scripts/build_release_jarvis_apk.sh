#!/usr/bin/env bash
set -e

echo "=== AMMU AI — JARVIS EDITION (np.made.ammu v5.1.0) Android Release Build ==="

BUILD_DIR="/tmp/ammu_jarvis_v510_build"
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
if [ -f "public/downloads/ammu-ai-v5.0.2.apk" ]; then
    unzip -p public/downloads/ammu-ai-v5.0.2.apk res/mipmap-hdpi-v4/ic_launcher.png > "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" || true
fi
if [ ! -s "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" ]; then
    python3 -c "import base64; open('$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png', 'wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVGhD7cExAQAAAMKg9U9tCy8gAAAAAAAAAAAAAADAhyU1AAG/5p9uAAAAAElFTkSuQmCC'))"
fi

# 2. String Resources
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
echo "Copying web production bundle into assets/www..."
cp -r dist/* "$BUILD_DIR/assets/www/"
rm -rf "$BUILD_DIR/assets/www/downloads"
rm -rf "$BUILD_DIR/assets/www/assets/aistudio"

# 4. Create AndroidManifest.xml for JARVIS Edition v5.1.0
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="np.made.ammu"
    android:versionCode="510"
    android:versionName="5.1.0">

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

# 5. Create native MainActivity.java with JARVIS Bridge
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
    private static final String TAG = "AmmuJarvis";
    private static final int REQ_PERMISSIONS = 510;
    private static final int REQ_SPEECH = 511;
    private static final int REQ_CAMERA = 512;

    private WebView webView;
    private TextToSpeech tts;
    private boolean isTorchOn = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hardware acceleration for JARVIS Arc Reactor & animations
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        // Initialize Android Text-to-Speech
        try {
            tts = new TextToSpeech(this, this);
        } catch (Exception e) {
            Log.e(TAG, "TTS initialization error: " + e.getMessage());
        }

        // Request runtime permissions on Android 6.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ArrayList<String> perms = new ArrayList<>();
            perms.add("android.permission.RECORD_AUDIO");
            perms.add("android.permission.CAMERA");
            perms.add("android.permission.READ_CONTACTS");
            perms.add("android.permission.CALL_PHONE");
            if (Build.VERSION.SDK_INT >= 33) {
                perms.add("android.permission.POST_NOTIFICATIONS");
            }
            requestPermissions(perms.toArray(new String[0]), REQ_PERMISSIONS);
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
        settings.setUserAgentString(settings.getUserAgentString() + " AmmuAI/5.1.0 JARVIS np.made.ammu");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                Log.d(TAG, "Granting WebView permission: " + request.toString());
                request.grant(request.getResources());
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d(TAG, "[JARVIS Console] " + cm.message() + " (" + cm.sourceId() + ":" + cm.lineNumber() + ")");
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
                Log.i(TAG, "AMMU AI JARVIS v5.1.0 loaded: " + url);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView load error: " + description + " URL: " + failingUrl);
            }
        });

        // Add Native JavaScript Bridge
        webView.addJavascriptInterface(new AmmuNativeBridge(this), "AmmuAndroidBridge");

        // Load offline application
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

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_SPEECH && resultCode == RESULT_OK && data != null) {
            ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (matches != null && !matches.isEmpty()) {
                final String spokenText = matches.get(0);
                if (webView != null) {
                    webView.post(new Runnable() {
                        @Override
                        public void run() {
                            String safeText = spokenText.replace("'", "\\'");
                            webView.evaluateJavascript("if (window.onNativeSpeechResult) { window.onNativeSpeechResult('" + safeText + "'); }", null);
                        }
                    });
                }
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
            return "5.1.0";
        }

        @JavascriptInterface
        public int getVersionCode() {
            return 510;
        }

        @JavascriptInterface
        public boolean hasRecordAudioPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                return ctx.checkSelfPermission("android.permission.RECORD_AUDIO") == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public boolean hasNotificationPermission() {
            if (Build.VERSION.SDK_INT >= 33) {
                return ctx.checkSelfPermission("android.permission.POST_NOTIFICATIONS") == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public boolean hasCameraPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                return ctx.checkSelfPermission("android.permission.CAMERA") == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public boolean hasTtsEngine() {
            return tts != null;
        }

        @JavascriptInterface
        public int getBatteryLevel() {
            try {
                IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
                Intent batteryStatus = ctx.registerReceiver(null, ifilter);
                if (batteryStatus != null) {
                    int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                    int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                    if (level >= 0 && scale > 0) {
                        return (int) ((level / (float) scale) * 100);
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Battery level query failed: " + e.getMessage());
            }
            return 85;
        }

        @JavascriptInterface
        public boolean isCharging() {
            try {
                IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
                Intent batteryStatus = ctx.registerReceiver(null, ifilter);
                if (batteryStatus != null) {
                    int status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
                    return status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL;
                }
            } catch (Exception e) {
                Log.w(TAG, "Charging query error: " + e.getMessage());
            }
            return false;
        }

        @JavascriptInterface
        public void toggleFlashlight(boolean enable) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    CameraManager camManager = (CameraManager) ctx.getSystemService(Context.CAMERA_SERVICE);
                    if (camManager != null) {
                        String cameraId = camManager.getCameraIdList()[0];
                        camManager.setTorchMode(cameraId, enable);
                        isTorchOn = enable;
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Torch toggle error: " + e.getMessage());
                }
            }
        }

        @JavascriptInterface
        public boolean isFlashlightOn() {
            return isTorchOn;
        }

        @JavascriptInterface
        public void setVolume(int level) {
            try {
                AudioManager am = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
                if (am != null) {
                    int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                    int target = (int) ((level / 100.0f) * max);
                    am.setStreamVolume(AudioManager.STREAM_MUSIC, target, AudioManager.FLAG_SHOW_UI);
                }
            } catch (Exception e) {
                Log.w(TAG, "Volume error: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public int getVolumeLevel() {
            try {
                AudioManager am = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
                if (am != null) {
                    int curr = am.getStreamVolume(AudioManager.STREAM_MUSIC);
                    int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                    return (int) ((curr / (float) max) * 100);
                }
            } catch (Exception e) {}
            return 70;
        }

        @JavascriptInterface
        public void openApp(String appNameOrPkg) {
            if (appNameOrPkg == null) return;
            try {
                PackageManager pm = ctx.getPackageManager();
                Intent intent = pm.getLaunchIntentForPackage(appNameOrPkg);
                if (intent == null) {
                    if (appNameOrPkg.equalsIgnoreCase("youtube")) {
                        intent = pm.getLaunchIntentForPackage("com.google.android.youtube");
                        if (intent == null) intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://youtube.com"));
                    } else if (appNameOrPkg.equalsIgnoreCase("settings")) {
                        intent = new Intent(Settings.ACTION_SETTINGS);
                    } else if (appNameOrPkg.equalsIgnoreCase("camera")) {
                        intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    } else if (appNameOrPkg.equalsIgnoreCase("maps")) {
                        intent = new Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=Kathmandu"));
                    }
                }
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    ctx.startActivity(intent);
                }
            } catch (Exception e) {
                Log.e(TAG, "openApp failed: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public void launchCamera() {
            try {
                Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                ctx.startActivity(intent);
            } catch (Exception e) {
                Log.w(TAG, "launchCamera error: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public void openMaps(String query) {
            try {
                Uri uri = Uri.parse("geo:0,0?q=" + Uri.encode(query));
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                intent.setPackage("com.google.android.apps.maps");
                if (intent.resolveActivity(ctx.getPackageManager()) != null) {
                    ctx.startActivity(intent);
                } else {
                    ctx.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.google.com/?q=" + Uri.encode(query))));
                }
            } catch (Exception e) {
                Log.w(TAG, "openMaps error: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public void startNativeSpeechRecognition() {
            if (ctx instanceof Activity) {
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ne-NP");
                intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "अम्मु जार्विससँग बोल्नुहोस्...");
                try {
                    ((Activity) ctx).startActivityForResult(intent, REQ_SPEECH);
                } catch (Exception e) {
                    Log.e(TAG, "Speech recognizer not found: " + e.getMessage());
                }
            }
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
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "jarvis_tts_" + System.currentTimeMillis());
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
    --out "$BUILD_DIR/ammu-ai-v5.1.0.apk" \
    "$BUILD_DIR/aligned.apk"

# 12. Verify Signed APK
echo "Verifying APK signature..."
apksigner verify --verbose "$BUILD_DIR/ammu-ai-v5.1.0.apk"

echo "Verifying APK badging..."
aapt dump badging "$BUILD_DIR/ammu-ai-v5.1.0.apk" | head -n 12

# 13. Copy to deliverable locations
echo "Deploying final APK deliverables..."
mkdir -p /app/applet/public/downloads
mkdir -p "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7"

cp "$BUILD_DIR/ammu-ai-v5.1.0.apk" /app/applet/public/downloads/ammu-ai-v5.1.0.apk
cp "$BUILD_DIR/ammu-ai-v5.1.0.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.1.0.apk"

# Keep previous filename targets synced
cp "$BUILD_DIR/ammu-ai-v5.1.0.apk" /app/applet/public/downloads/ammu-ai-v5.0.2.apk
cp "$BUILD_DIR/ammu-ai-v5.1.0.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.2.apk"
cp "$BUILD_DIR/ammu-ai-v5.1.0.apk" /app/applet/public/downloads/ammu-ai-v5.0.1.apk
cp "$BUILD_DIR/ammu-ai-v5.1.0.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.1.apk"
cp "$BUILD_DIR/ammu-ai-v5.1.0.apk" /app/applet/public/downloads/ammu-ai-v5.0.0.apk
cp "$BUILD_DIR/ammu-ai-v5.1.0.apk" "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.0.apk"

# Calculate SHA256
sha256sum "$BUILD_DIR/ammu-ai-v5.1.0.apk" > /app/applet/public/downloads/ammu-ai-v5.1.0.apk.sha256
sha256sum "$BUILD_DIR/ammu-ai-v5.1.0.apk" > "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.1.0.apk.sha256"

# 14. Upload to tmpfiles.org
echo "Uploading APK to tmpfiles.org..."
TMP_RESPONSE=$(curl -s -F "file=@$BUILD_DIR/ammu-ai-v5.1.0.apk" https://tmpfiles.org/api/v1/upload)
echo "tmpfiles response: $TMP_RESPONSE"
TMP_URL=$(python3 -c "import json, sys; res=json.loads('''$TMP_RESPONSE'''); url=res.get('data', {}).get('url', ''); print(url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/') if url else '')" || true)

if [ -n "$TMP_URL" ]; then
    echo "Direct tmpfiles download link: $TMP_URL"
    echo "$TMP_URL" > /app/applet/public/downloads/tmpfiles_url.txt
    echo "$TMP_URL" > "/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/tmpfiles_url.txt"
fi

echo "=== AMMU AI JARVIS v5.1.0 APK BUILD SUCCESSFUL ==="
ls -lh /app/applet/public/downloads/ammu-ai-v5.1.0.apk
cat /app/applet/public/downloads/ammu-ai-v5.1.0.apk.sha256
