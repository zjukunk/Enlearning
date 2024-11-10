import express from 'express';
import bodyParser from 'body-parser';
import User from './User';
import cors from 'cors';
import pool from "./db"

const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  const { username, password, invitecode } = req.body;
  if (!username || !password || !invitecode) {
    return res.status(400).send('请完整输入账号、密码与邀请码');
  }
  if (invitecode !== 'qsccy') {
    return res.status(400).send('邀请码错误，请耐心等待公测或联系我们获得邀请码');
  }
  try {
    const userId = await User.register({ username, password });
    res.status(201).send(`${username}注册成功！`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('请完整输入账号与密码');
  }
  try {
    const user = await User.login(username, password);
    if (user) {
      res.send(`用户 ${username} 登陆成功！`);
    } else {
      res.status(404).send('账号不存在或密码错误');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/word', async (req, res) => {
  const { type } = req.body;
  if (typeof type !== 'number' || (type !== 1 && type !== 2)) {
    return res.status(400).send('Invalid type parameter');
  }
  try {
    const [rows] = await pool.query('SELECT * FROM wordsheet');
    if (rows.length === 0) {
      throw new Error('No words found in the database');
    }
    const allWords = rows.map(row => ({
      id: row.id,
      word: row.word,
      part_of_speech: row.part_of_speech,
      chinese_meaning: row.chinese_meaning
    }));
    const correctWord = allWords[Math.floor(Math.random() * allWords.length)];
    const incorrectWords = allWords.filter(word => word.id !== correctWord.id);
    let options = [...incorrectWords.slice(0, 3), correctWord];
    if (type === 1) {
      options = options.map(word => word.chinese_meaning);
    } else if (type === 2) {
      options = options.map(word => word.word);
    }
    options.sort(() => Math.random() - 0.5); // Shuffle the options
    const answer = options.indexOf(type === 1 ? correctWord.chinese_meaning : correctWord.word);
    res.send({
      question: correctWord.word,
      part_of_speech: correctWord.part_of_speech,
      meaning: type === 1 ? correctWord.chinese_meaning : '',
      options,
      answer
    });
  } catch (error) {
    res.status(500).send('Error retrieving word data');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});