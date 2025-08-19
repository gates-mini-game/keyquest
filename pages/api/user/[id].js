import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://<kralmanyak>:<090716Mmk->@cluster0.oxpybks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      await client.connect();
      const db = client.db('keyquest');
      const user = await db.collection('users').findOne({ userId: id });
      res.status(200).json(user || { score: 0, keys: 0 });
    } catch (error) {
      res.status(500).json({ error: 'DB hatası' });
    }
  }

  if (req.method === 'POST') {
    const { score } = req.body;
    try {
      await client.connect();
      const db = client.db('keyquest');
      await db.collection('users').updateOne(
        { userId: id },
        { $inc: { score } },
        { upsert: true }
      );
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Güncelleme hatası' });
    }
  }
}
