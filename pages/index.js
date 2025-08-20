import { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import styles from '../styles/Home.module.css';

const Home = () => {
  const { user, tg } = useTelegram();
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, result
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [correctDoor, setCorrectDoor] = useState(null);

  // AdsGram script yükle (sayfa açılırken)
  useEffect(() => {
    const loadAdsGram = () => {
      if (!window.Adsgram) {
        const script = document.createElement('script');
        script.src = 'https://adsgram.app/sdk/create.js';
        script.async = true;
        script.onload = () => console.log('AdsGram yüklendi');
        script.onerror = () => console.error('AdsGram yüklenemedi');
        document.head.appendChild(script);
      }
    };
    loadAdsGram();
  }, []);

  // Kullanıcı verisini yükle
  useEffect(() => {
    if (user) {
      fetch(`/api/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setScore(data.score || 0);
          setKeys(data.keys || 0);
        })
        .catch(() => tg.showAlert('Veri alınamadı.'));
    }
  }, [user]);

  // Cüzdan Bağlantısı (TonConnect UI)
  const connectWallet = async () => {
    if (!window.TonConnectUI) {
      await import('@tonconnect/ui');
    }
    const connector = new window.TonConnectUI({
      manifestUrl: 'https://keyquest.vercel.app/tonconnect-manifest.json',
    });
    await connector.connect();
    setIsConnected(true);
    tg.showAlert('Cüzdan bağlandı!');
  };

  // Anahtar Satın Al (1 TON karşılığı)
  const buyKeys = async () => {
    if (!isConnected) return tg.showAlert('Önce cüzdan bağlayın.');
    const res = await fetch('/api/buy-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: 5 }),
    });
    const data = await res.json();
    if (data.success) {
      setKeys(prev => prev + 5);
      tg.showAlert('5 anahtar satın alındı!');
    } else {
      tg.showAlert('Satın alma başarısız.');
    }
  };

  // Reklam Göster (AdsGram)
  const showAd = async () => {
    try {
      if (!window.Adsgram) {
        tg.showAlert('Reklam yükleniyor, lütfen bekleyin...');
        return;
      }

      await window.Adsgram.showAd(int-14050); // ← Buraya kendi BLOCK ID'n yaz (AdsGram'dan al)
      setKeys(prev => prev + 5);
      tg.showAlert('🎉 Reklamı izledin! 5 anahtar eklendi.');
    } catch (err) {
      tg.showAlert('Reklam izlenemedi veya geçersiz.');
    }
  };

  // Oyun Başlat (Kapı seçimi)
  const startGame = () => {
    if (keys < 1) return tg.showAlert('Yeterli anahtar yok!');
    setKeys(prev => prev - 1);
    setCorrectDoor(Math.floor(Math.random() * 3));
    setGameState('playing');
    setSelectedDoor(null);
  };

  // Kapı Seçimi
  const selectDoor = (doorIndex) => {
    if (gameState !== 'playing') return;
    setSelectedDoor(doorIndex);

    if (doorIndex === correctDoor) {
      setMultiplier(prev => prev * 2);
      tg.showAlert(`✅ Doğru kapı! Çarpan: x${multiplier * 2}`);
    } else {
      setMultiplier(1);
      tg.showAlert('❌ Yanlış kapı! Çarpan sıfırlandı.');
    }
    setGameState('result');
  };

  // Puanı Al
  const claimPrize = () => {
    setScore(prev => prev + 10 * multiplier);
    setMultiplier(1);
    setGameState('waiting');
    tg.showAlert(`🏆 ${10 * multiplier} puan kazandın!`);
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Üst Başlık */}
        <div className={styles.header}>
          <div className={styles.stage}>1/10 Stage</div>
          <div className={styles.points}>
            <span className={styles.keyIcon}>🔑</span>
            <span>{keys}</span>
            <button onClick={buyKeys} className={styles.buyBtn}>+</button>
          </div>
        </div>

        {/* Oyun Alanı */}
        <div className={styles.gameArea}>
          <div className={styles.doorContainer}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`${styles.door} ${selectedDoor === index ? styles.selected : ''}`}
                onClick={() => gameState === 'playing' && selectDoor(index)}
              >
                <img src={`/images/door${index + 1}.png`} alt={`Kapı ${index + 1}`} />
              </div>
            ))}
          </div>

          {/* Butonlar */}
          {gameState === 'waiting' && (
            <button onClick={startGame} className={styles.playBtn}>
              Knock Knock, Who's There?
            </button>
          )}

          {gameState === 'result' && (
            <button onClick={claimPrize} className={styles.claimBtn}>
              Puanı Al
            </button>
          )}

          {/* Reklam Butonu */}
          <button onClick={showAd} className={styles.adBtn}>
            🎬 Reklam İzle, 5 Anahtar Kazan!
          </button>

          {/* Cüzdan Bağlantısı */}
          {!isConnected && (
            <button onClick={connectWallet} className={styles.connectBtn}>
              Cüzdan Bağla
            </button>
          )}
        </div>

        {/* Alt Menü */}
        <div className={styles.footer}>
          <button onClick={() => tg.showAlert('Görevler gelicek')} className={styles.tabBtn}>Tasks</button>
          <button onClick={() => tg.showAlert('Liderlik tablosu')} className={styles.tabBtn}>Ranking</button>
          <button onClick={() => tg.showAlert('Davet linki: t.me/yourbot?start=123')} className={styles.tabBtn}>Invite</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
