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
const app = (0, express_1.default)();
const port = 3000;
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
