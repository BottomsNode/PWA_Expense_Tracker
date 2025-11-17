package com.bottomsnode.notifications;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NotificationListener")
public class NotificationPlugin extends Plugin {

    @Override
    public void load() {
        MyNotificationService.setBridge(getBridge());
    }

    public void requestPermission(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", true);
        call.resolve(ret);
    }
}
