import { registerPlugin } from "@capacitor/core";
import type { NotificationListenerPlugin } from "./definitions";

const NotificationListener = registerPlugin<NotificationListenerPlugin>(
  "NotificationListener",
  {
    web: () => import("./web").then((m) => new m.NotificationWeb()),
  },
);

export default NotificationListener;
