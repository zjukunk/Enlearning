"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const User_1 = __importDefault(require("./User"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const port = 8008;
app.use((0, cors_1.default)({
    origin: '*',
    optionsSuccessStatus: 200
}));
app.use(body_parser_1.default.json());
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, invitecode } = req.body;
    if (!username || !password || !invitecode) {
        return res.status(400).send('请完整输入账号、密码与邀请码');
    }
    if (invitecode !== 'qsccy') {
        return res.status(400).send('邀请码错误，请耐心等待公测或联系我们获得邀请码');
    }
    try {
        const userId = yield User_1.default.register({ username, password });
        res.status(201).send(`${username}注册成功！`);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('请完整输入账号与密码');
    }
    try {
        const user = yield User_1.default.login(username, password);
        if (user) {
            res.send(`用户 ${username} 登陆成功！`);
        }
        else {
            res.status(404).send('账号不存在或密码错误');
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
app.post('/word', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.body;
    if (typeof type !== 'number' || (type !== 1 && type !== 2 && type !== 3)) {
        return res.status(400).send('Invalid type parameter');
    }
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM wordsheet');
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
        if (type === 1 || type === 2) {
            const incorrectWords = allWords.filter(word => word.id !== correctWord.id);
            let options = [...incorrectWords.slice(0, 3), correctWord];
            if (type === 1) {
                options = options.map(word => word.chinese_meaning);
            }
            else if (type === 2) {
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
            });
        }
        else if (type === 3) {
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
    }
    catch (error) {
        res.status(500).send('Error retrieving word data');
    }
}));
app.get('/mathtest', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = parseInt(req.query.type, 10);
    const id = parseInt(req.query.id, 10);
    if (isNaN(type) || (type !== 1 && type !== 2)) {
        return res.status(400).send('Invalid type parameter');
    }
    if (isNaN(id) || ((type === 1 && (id < 1 || id > 99)) || (type === 2 && (id < 1 || id > 3)))) {
        return res.status(400).send('Invalid id parameter');
    }
    try {
        let results;
        let questionIds = [];
        if (type === 1) {
            results = yield db_1.default.query('SELECT id FROM mathtest WHERE question_set = ?', [id]);
        }
        else if (type === 2) {
            results = yield db_1.default.query('SELECT id FROM mathtest WHERE difficulty = ? LIMIT 5', [id]);
        }
        if (results[0].length === 0) {
            throw new Error('No questions found in the database');
        }
        questionIds = results[0].map(row => row.id).filter((id) => typeof id === 'number' && id !== null);
        res.send({
            count: questionIds.length,
            questionIds
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving math test data');
    }
}));
app.post('/mathget', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (typeof id !== 'number' || id < 1) {
        return res.status(400).send('Invalid id parameter');
    }
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM mathtest WHERE id = ?', [id]);
        if (rows.length === 0) {
            throw new Error('No math test found with the given id');
        }
        const mathTest = rows[0];
        res.send({
            id: mathTest.id,
            question: mathTest.question,
            answer: mathTest.answer,
            question_set: mathTest.question_set,
            difficulty: mathTest.difficulty,
            time_limit: mathTest.time_limit
        });
    }
    catch (error) {
        res.status(500).send('Error retrieving math test data');
    }
}));
app.use((0, cookie_parser_1.default)());
app.post('/inputhistory', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, score, username } = req.body;
    if (!username || id === undefined || score === undefined) {
        return res.status(400).send('请提供有效的用户名、id和分数');
    }
    const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
        const [result] = yield db_1.default.query('INSERT INTO history (username, question_id, answertime, score) VALUES (?, ?, ?, ?)', [username, id, time, score]);
        res.send(`历史记录已添加，ID为 ${result.insertId}`);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
app.get('/gethistory', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query; // 从查询参数中获取 username
    if (!username) {
        return res.status(400).send('请提供用户名');
    }
    try {
        // 查询 history 表，获取前 50 条记录
        const [rows] = yield db_1.default.query('SELECT * FROM history WHERE username = ? LIMIT 50', [username]);
        res.json(rows); // 将查询结果以 JSON 格式返回
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
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
