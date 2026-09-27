package ru.avtoimperia.game;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView web;

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
    protected void onPause() { super.onPause(); web.onPause(); }

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
