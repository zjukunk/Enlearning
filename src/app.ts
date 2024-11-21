import express from 'express';
import bodyParser from 'body-parser';
import User from './User';
import cors from 'cors';
import pool from "./db"

const app = express();
const port = 8008;

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
  if (typeof type !== 'number' || (type !== 1 && type !== 2 && type !== 3)) {
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
    if(type === 1 || type === 2){
    const incorrectWords = allWords.filter(word => word.id !== correctWord.id);
    let options = [...incorrectWords.slice(0, 3), correctWord];
    if (type === 1) {
      options = options.map(word => word.chinese_meaning);
    } else if (type === 2) {
      options = options.map(word => word.word);
    }
    options.sort(() => Math.random() - 0.5); // Shuffle the options
    const answer = options.indexOf(type === 1 ? correctWord.chinese_meaning : correctWord.word);
    // 修改部分：当type为2时，question字段返回correctWord.chinese_meaning
    const question = type === 2 ? correctWord.chinese_meaning : correctWord.word;
    res.send({
      question,
      part_of_speech: correctWord.part_of_speech,
      meaning: type === 1 ? correctWord.chinese_meaning : '', // 这里保持不变
      options,
      answer
    })}else if (type === 3) {
      const question = createQuestionWithMaskedLetters(correctWord.word);
      const answer = correctWord.word;
      res.send({
        question,
        part_of_speech: correctWord.part_of_speech,
        meaning: correctWord.chinese_meaning,
        answer
      });
      return; // 直接返回，不再执行后面的代码
    }
  } catch (error) {
    res.status(500).send('Error retrieving word data');
  }
});



app.get('/mathtest', async (req: Request, res: Response) => {
  const type = parseInt(req.query.type as string, 10);
  const id = parseInt(req.query.id as string, 10);

  if (isNaN(type) || (type !== 1 && type !== 2)) {
    return res.status(400).send('Invalid type parameter');
  }
  if (isNaN(id) || ((type === 1 && (id < 1 || id > 99)) || (type === 2 && (id < 1 || id > 3)))) {
    return res.status(400).send('Invalid id parameter');
  }

  try {
    let results;
    let questionIds: number[] = [];

    if (type === 1) {
      results = await pool.query('SELECT id FROM mathtest WHERE question_set = ?', [id]);
    } else if (type === 2) {
      results = await pool.query('SELECT id FROM mathtest WHERE difficulty = ? LIMIT 5', [id]);
    }

    if (results[0].length === 0) {
      throw new Error('No questions found in the database');
    }

    questionIds = results[0].map(row => row.id).filter((id): id is number => typeof id === 'number' && id !== null);

    res.send({
      count: questionIds.length,
      questionIds
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving math test data');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

function createQuestionWithMaskedLetters(word) {
  const maskedWordArray = word.split('').map((char, index) => {
    // 保留首字母和一个随机字母，其余用?替换
    if (index !== 0 || (index !== 0 && index !== Math.floor(Math.random() * (word.length - 1)))) {
      return '?';
    }
    return char;
  });
  // 确保至少有一个非首字母的随机字母被保留
  const hasOtherLetter = maskedWordArray.some((char, index) => index !== 0 && char !== '?');
  if (!hasOtherLetter) {
    const otherLetterIndex = Math.floor(Math.random() * (word.length - 1)) + 1;
    maskedWordArray[otherLetterIndex] = word[otherLetterIndex];
  }
  return maskedWordArray.join('');
}