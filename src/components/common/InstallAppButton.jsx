import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone PWA app
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS detection
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos && !window.navigator.standalone) {
      setIsInstallable(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show iOS or general install instructions
      setShowIosGuide(true);
    }
  };

  if (isStandalone || !isInstallable) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all hover:scale-105"
        title="Install Delivery Express App onto your Home Screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* iOS / Browser Install Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Install Delivery Express
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Install this app on your phone home screen for 1-tap fast access!
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl text-xs text-left space-y-2 text-slate-700 dark:text-zinc-300 font-medium">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Tap the <strong>Share</strong> button (Safari) or the <strong>3 Dots (⋮)</strong> menu (Chrome/Brave).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Select <strong>"Add to Home Screen"</strong> or <strong>"Install app"</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-2xl text-xs"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
