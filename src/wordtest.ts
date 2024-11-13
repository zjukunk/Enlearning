//这段代码已经弃用

/*
import express from 'express';
import { getWord } from './worddb';

const router = express.Router();

router.post('/word', async (req, res) => {
  const { type } = req.body;
  if (typeof type !== 'number' || (type !== 1 && type !== 2)) {
    return res.status(400).send('Invalid type parameter');
  }
  try {
    const wordData = await getWord(type);
    res.send(wordData);
  } catch (error) {
    res.status(500).send('Error retrieving word data');
  }
});

export default router;
*/