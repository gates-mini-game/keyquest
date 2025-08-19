import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/keyquest');

export default async function handler(req, res) {
  const { userId, amount } = req.body;

  if (req.method === 'POST') {
    try {
      await client.connect();
      const db = client.db('keyquest');
      await db.collection('users').updateOne(
        { userId },
        { $inc: { keys: amount } },
        { upsert: true }
      );

      // Buraya kendi TON cüzdan adresini yaz
      const developerWallet = "EQABC...123";
      console.log("Ödeme alındı, adres:", developerWallet);

      res.status(200).json({ success: true, keys: amount });
    } catch (error) {
      res.status(500).json({ error: 'Satın alma hatası' });
    }
  }
}
