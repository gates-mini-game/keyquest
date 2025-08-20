import { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { TonConnect } from '@tonconnect/sdk';
import QRCode from 'qrcode.react';

const Home = () => {
  const { user, tg } = useTelegram();
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [deepLink, setDeepLink] = useState('');
  const [tonConnect, setTonConnect] = useState(null);

  useEffect(() => {
    const connector = new TonConnect({
      manifestUrl: 'https://keyquest-nmx7.vercel.app/tonconnect-manifest.json',
    });
    setTonConnect(connector);
  }, []);

  const connectWallet = async () => {
    if (!tonConnect) return;

    try {
      const session = await tonConnect.connect({
        jsBridgeKey: 'tonkeeper',
        items: [
          {
            name: 'ton_addr',
            url: 'https://t.me/tonwallet',
          },
        ],
      });

      setDeepLink(session.deepLink);
      setShowQR(true);
      setIsConnected(true);
      tg.showAlert('Cüzdan bağlandı!');
    } catch (error) {
      tg.showAlert('Bağlantı hatası: ' + error.message);
    }
  };

  const buyKeys = async () => {
    if (!isConnected) return tg.showAlert('Cüzdan bağlanmadı.');
    const res = await fetch('/api/buy-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: 5 }),
    });
    const data = await res.json();
    if (data.success) {
      setKeys(prev => prev + 5);
      tg.showAlert('5 anahtar satın alındı!');
    }
  };

  const openDoor = () => {
    if (keys < 1) return tg.showAlert('Yeterli anahtar yok!');
    setKeys(prev => prev - 1);
    if (Math.random() > 0.5) {
      setMultiplier(prev => prev * 2);
      tg.showAlert(`Doğru kapı! Çarpan: x${multiplier * 2}`);
    } else {
      setMultiplier(1);
      tg.showAlert('Yanlış kapı! Çarpan sıfırlandı.');
    }
  };

  const claimPrize = () => {
    setScore(prev => prev + 10 * multiplier);
    setMultiplier(1);
    tg.showAlert(`Puan kazandın: ${10 * multiplier}`);
  };

  const startClickGame = () => {
    let clicks = 0;
    const startTime = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startTime >= 10000) {
        clearInterval(timer);
        setScore(prev => prev + clicks);
        tg.showAlert(`${clicks} kez tıkladın!`);
      }
    }, 100);
    document.onclick = () => clicks++;
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: 'auto',
      padding: '20px',
      background: '#121212',
      color: 'white',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <h2 style={{ color: '#FF9A00' }}>🔑 Key Quest</h2>
      <p>Puan: <span style={{ color: '#FF9A00', fontWeight: 'bold' }}>{score}</span></p>
      <p>Anahtar: <span style={{ color: '#FF9A00', fontWeight: 'bold' }}>{keys}</span></p>

      <button onClick={connectWallet} style={{
        background: '#FF9A00',
        border: 'none',
        padding: '12px',
        width: '100%',
        margin: '10px 0',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        Cüzdan Bağla
      </button>

      <button onClick={buyKeys} style={{
        background: '#FF9A00',
        border: 'none',
        padding: '12px',
        width: '100%',
        margin: '10px 0',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        5 Anahtar Satın Al (1 TON)
      </button>

     <button onClick={showAd} className={styles.adBtn}>
    🎬 Reklam İzle, 5 Anahtar Kazan!
     </button>
          
      <button onClick={openDoor} style={{
        background: '#FF9A00',
        border: 'none',
        padding: '12px',
        width: '100%',
        margin: '10px 0',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        Kapı Aç
      </button>

      <button onClick={claimPrize} style={{
        background: '#FF9A00',
        border: 'none',
        padding: '12px',
        width: '100%',
        margin: '10px 0',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        Puanı Al
      </button>

      <button onClick={startClickGame} style={{
        background: '#FF9A00',
        border: 'none',
        padding: '12px',
        width: '100%',
        margin: '10px 0',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        Tıklama Oyunu
      </button>

      {showQR && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <QRCode value={deepLink} size={200} />
          <p>Tonkeeper ile tara</p>
          <button onClick={() => setShowQR(false)}>Kapat</button>
        </div>
      )}
    </div>
  );
};


// AdsGram Reklam Fonksiyonu
const showAd = async () => {
  try {
    // AdsGram script yüklü mü kontrol et
    if (!window.Adsgram) {
      await loadScript('https://adsgram.app/sdk/create.js');
    }

    // Reklamı göster (Block ID = 12345)
    window.Adsgram.showAd(12345).then(() => {
      // Reklam başarıyla izlendi
      setKeys(prev => prev + 5);
      tg.showAlert('5 anahtar kazandın!');
    }).catch((error) => {
      // Kullanıcı reklamı izlemedi veya kapatırsa
      console.log('Reklam izlenmedi:', error);
    });
  } catch (err) {
    tg.showAlert('Reklam yüklenemedi. Daha sonra tekrar dene.');
  }
};

// Script Yükleme Fonksiyonu
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Script yüklenemedi'));
    document.head.appendChild(script);
  });
};

export default Home;
