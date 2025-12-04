package com.BinaryStudio8.notifications;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

public class MyNotificationService extends NotificationListenerService {

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String pkg = sbn.getPackageName();
        String title = "";
        String text = "";

        if (sbn.getNotification().extras != null) {
            CharSequence t = sbn.getNotification().extras.getCharSequence("android.title");
            CharSequence s = sbn.getNotification().extras.getCharSequence("android.text");
            title = t != null ? t.toString() : "";
            text = s != null ? s.toString() : "";
        }

        NotificationPlugin.emitNotification(pkg, title, text);
    }
}
