import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, ExpenseProvider, LocationProvider } from "@/providers";
import App from "@/App";
import { useServiceWorker } from "@/hooks";
import { Popup } from "@/base";
import { NotificationListenerWrapper } from "@/components";

const RootApp = () => {
  const { updateAvailable, reloadApp } = useServiceWorker();

  return (
    <>
      <BrowserRouter>
        <ThemeProvider>
          <ExpenseProvider>
            <LocationProvider>
              <NotificationListenerWrapper />
              <App />
            </LocationProvider>
          </ExpenseProvider>
        </ThemeProvider>
      </BrowserRouter>

      {updateAvailable && (
        <Popup
          message="🆕 A new version of the app is available!"
          type="info"
          show={true}
          onClose={reloadApp}
        />
      )}
    </>
  );
};

export default RootApp;
