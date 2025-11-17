package com.bottomsnode.notifications;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;

public class MyNotificationService extends NotificationListenerService {

    private static Bridge bridge;

    public static void setBridge(Bridge b) {
        bridge = b;
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (bridge == null) return;

        String pkg = sbn.getPackageName();
        String title = "";
        String text = "";

        if (sbn.getNotification().extras != null) {
            CharSequence t = sbn.getNotification().extras.getCharSequence("android.title");
            CharSequence s = sbn.getNotification().extras.getCharSequence("android.text");
            title = t != null ? t.toString() : "";
            text = s != null ? s.toString() : "";
        }

        JSObject data = new JSObject();
        data.put("package", pkg);
        data.put("title", title);
        data.put("text", text);

        bridge.triggerWindowJSEvent("notificationReceived", data.toString());
    }
}
