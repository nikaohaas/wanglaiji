package com.liu.cashledger;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends Activity {
    private WebView webView;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setTextZoom(100);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setBackgroundColor(0xFFF6F3EB);
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

    @Override public void onBackPressed() {
        webView.evaluateJavascript("window.appBack && window.appBack()", value -> {
            if ("false".equals(value)) super.onBackPressed();
        });
    }
}
