package com.kanjilearn.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onStart() {
        super.onStart();
        WebView webView = this.bridge.getWebView();
        // Disable the rubber-band/glow overscroll effect so scrolling feels
        // like a native list rather than a browser page.
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
    }

    @Override
    public void onBackPressed() {
        WebView webView = this.bridge.getWebView();
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
