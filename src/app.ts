//main

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import User from './User';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/register', async (req: any, res: any) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }
  try {
    const userId = await User.register({ username, password });
    res.status(201).send(`User ${username} registered with ID ${userId}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 设置登录路由
app.post('/login', async (req: any, res: any) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }
  try {
    const user = await User.login(username, password);
    if (user) {
      res.send(`User ${username} logged in successfully`);
    } else {
      res.status(404).send('User not found or incorrect password');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});