package com.bottomsnode.notifications;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Set;

@CapacitorPlugin(name = "NotificationListener")
public class NotificationPlugin extends Plugin {

    private static NotificationPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context unavailable");
            return;
        }

        boolean granted = isNotificationAccessGranted(context);

        if (!granted) {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }

        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    static void emitNotification(String pkg, String title, String text) {
        NotificationPlugin plugin = instance;
        if (plugin == null || plugin.getBridge() == null) {
            return;
        }

        JSObject data = new JSObject();
        data.put("package", pkg);
        data.put("title", title);
        data.put("text", text);

        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(() -> plugin.notifyListeners("notificationReceived", data));
    }

    private boolean isNotificationAccessGranted(Context context) {
        Set<String> enabledPackages = NotificationManagerCompat.getEnabledListenerPackages(context);
        return enabledPackages.contains(context.getPackageName());
    }
}
