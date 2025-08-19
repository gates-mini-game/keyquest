import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [user, setUser] = useState(null);
  const [tg, setTg] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      setTg(webApp);
      setUser(webApp.initDataUnsafe.user);
      webApp.expand();
    }
  }, []);

  return { user, tg };
};
