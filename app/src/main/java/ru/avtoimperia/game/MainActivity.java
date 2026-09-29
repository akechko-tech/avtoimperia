package ru.avtoimperia.game;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.Locale;

public class MainActivity extends Activity {
    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsOk = false;

    /** Голос диктора для кинохроники: WebView не умеет Web Speech, поэтому говорит системный синтезатор речи. */
    public class Voice {
        @JavascriptInterface public boolean ttsReady() { return ttsOk; }
        @JavascriptInterface public void speak(String text) {
            if (ttsOk && tts != null) tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "reel");
        }
        @JavascriptInterface public void stop() { if (tts != null) tts.stop(); }
        @JavascriptInterface public boolean speaking() { return tts != null && tts.isSpeaking(); }
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.parseColor("#0d2136"));
        getWindow().setNavigationBarColor(Color.parseColor("#0a1a2b"));
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); // экран не гаснет во время гонок
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0d2136"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // сохранения игры
        s.setCacheMode(WebSettings.LOAD_DEFAULT); // фото кэшируются и работают офлайн
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);                    // системный размер шрифта не ломает вёрстку
        web.setWebViewClient(new WebViewClient());
        try {
            tts = new TextToSpeech(this, status -> {
                if (status == TextToSpeech.SUCCESS && tts != null) {
                    int r = tts.setLanguage(new Locale("ru", "RU"));
                    ttsOk = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
                    tts.setSpeechRate(0.95f);
                    tts.setPitch(0.9f);
                }
            });
        } catch (Exception e) { tts = null; }
        web.addJavascriptInterface(new Voice(), "AndroidTTS");
        if (state != null) web.restoreState(state);
        else web.loadUrl("file:///android_asset/index.html");
        setContentView(web);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); if (tts != null) tts.stop(); }

    @Override
    protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
        super.onDestroy();
    }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    public void onBackPressed() {
        // Игра сама закрывает окна и газеты; если закрывать нечего — выходим
        web.evaluateJavascript("(window.androidBack&&window.androidBack())?'1':'0'", v -> {
            if (!"\"1\"".equals(v)) MainActivity.super.onBackPressed();
        });
    }
}
