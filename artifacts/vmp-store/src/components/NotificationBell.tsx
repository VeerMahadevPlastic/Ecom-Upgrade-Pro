import { useState, useEffect } from "react";
import { Bell, X, CheckCircle } from "lucide-react";

const ONESIGNAL_APP_ID = "YOUR_ONESIGNAL_APP_ID";
const DISMISSED_KEY = "vmp_notif_dismissed";

declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: any[];
  }
}

export function NotificationBell() {
  const [showBanner, setShowBanner] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [oneSignalReady, setOneSignalReady] = useState(false);

  const isConfigured = ONESIGNAL_APP_ID !== "YOUR_ONESIGNAL_APP_ID";

  useEffect(() => {
    if (!isConfigured) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    if (window.OneSignal) {
      setOneSignalReady(true);
      window.OneSignal.isPushNotificationsEnabled?.().then((enabled: boolean) => {
        if (!enabled) {
          setTimeout(() => setShowBanner(true), 3000);
        } else {
          setSubscribed(true);
        }
      });
    }
  }, [isConfigured]);

  const handleSubscribe = async () => {
    if (!window.OneSignal) return;
    try {
      await window.OneSignal.showNativePrompt?.();
      const enabled = await window.OneSignal.isPushNotificationsEnabled?.();
      if (enabled) {
        setSubscribed(true);
        setShowBanner(false);
      }
    } catch {
      // user declined
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!isConfigured || subscribed) return null;

  return (
    <>
      {/* Floating bell button */}
      {!showBanner && (
        <button
          onClick={() => setShowBanner(true)}
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
          aria-label="Subscribe to notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      )}

      {/* Banner */}
      {showBanner && (
        <div className="fixed bottom-6 right-6 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Stock & Price Alerts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Get notified when new stock arrives or prices change.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubscribe}
              className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Subscribe
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 h-8 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
