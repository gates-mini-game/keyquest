import { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import styles from '../styles/Home.module.css';

const Home = () => {
  const { user, tg } = useTelegram();
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (user) {
      fetch(`/api/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setScore(data.score || 0);
          setKeys(data.keys || 0);
        });
    }
  }, [user]);

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
        tg.showAlert(`${clicks} kez tıkladın! ${clicks} puan kazandın.`);
      }
    }, 100);
    document.onclick = () => clicks++;
  };

  const renderHome = () => (
    <div className={styles.home}>
      <h2>🔑 Key Quest</h2>
      <p>Puan: <span className={styles.score}>{score}</span></p>
      <p>Anahtar: <span className={styles.keys}>{keys}</span></p>

      <button onClick={connectWallet}>Cüzdan Bağla</button>
      <button onClick={buyKeys}>5 Anahtar Satın Al (1 TON)</button>
      <button onClick={openDoor}>Kapı Aç</button>
      <button onClick={claimPrize}>Puanı Al</button>
      <button onClick={startClickGame}>Tıklama Oyunu</button>
    </div>
  );

  const renderTasks = () => (
    <div className={styles.tasks}>
      <h2>🎯 Sosyal Görevler</h2>
      <div className={styles.taskItem}>
        <img src="/images/join-telegram.png" alt="Join Telegram" />
        <p>Telegram'a Katıl</p>
        <p><span className={styles.reward}>+500 puan</span></p>
        <button onClick={() => tg.showAlert('Görev tamamlandı!')}>Tamamla</button>
      </div>
      <div className={styles.taskItem}>
        <img src="/images/follow-x.png" alt="Follow X" />
        <p>X'te Takip Et</p>
        <p><span className={styles.reward}>+1500 puan</span></p>
        <button onClick={() => tg.showAlert('Görev tamamlandı!')}>Tamamla</button>
      </div>
    </div>
  );

  const renderStreak = () => (
    <div className={styles.streak}>
      <h2>🔥 Günlük Streak</h2>
      <div className={styles.streakDays}>
        <div className={styles.day}>Gün 1: +100 puan, 3 anahtar</div>
        <div className={styles.day}>Gün 2: +110 puan, 3 anahtar</div>
        <div className={styles.day}>Gün 3: +120 puan, 4 anahtar</div>
      </div>
      <button onClick={() => tg.showAlert('Günlük ödül alındı!')}>Al</button>
    </div>
  );

  const renderLeaderboard = () => (
    <div className={styles.leaderboard}>
      <h2>🏆 Liderlik Tablosu</h2>
      <div className={styles.rankList}>
        <div>1. @user1: 10000</div>
        <div>2. @user2: 9800</div>
        <div>3. @user3: 9500</div>
      </div>
    </div>
  );

  const renderInvite = () => (
    <div className={styles.invite}>
      <h2>🔗 Arkadaş Davet Et</h2>
      <p>Davet linki: <code>https://t.me/KeyQuestGameBot?start={user?.id}</code></p>
      <button onClick={() => tg.showAlert('Davet linki kopyalandı!')}>Kopyala</button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? styles.active : ''}>Ana</button>
        <button onClick={() => setActiveTab('tasks')} className={activeTab === 'tasks' ? styles.active : ''}>Görevler</button>
        <button onClick={() => setActiveTab('streak')} className={activeTab === 'streak' ? styles.active : ''}>Streak</button>
        <button onClick={() => setActiveTab('leaderboard')} className={activeTab === 'leaderboard' ? styles.active : ''}>Lider</button>
        <button onClick={() => setActiveTab('invite')} className={activeTab === 'invite' ? styles.active : ''}>Davet</button>
      </div>

      {activeTab === 'home' && renderHome()}
      {activeTab === 'tasks' && renderTasks()}
      {activeTab === 'streak' && renderStreak()}
      {activeTab === 'leaderboard' && renderLeaderboard()}
      {activeTab === 'invite' && renderInvite()}
    </div>
  );
};

export default Home;
