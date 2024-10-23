"use strict";
//main
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
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json());
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    try {
        const userId = yield User_1.default.register({ username, password });
        res.status(201).send(`User ${username} registered with ID ${userId}`);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// 设置登录路由
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    try {
        const user = yield User_1.default.login(username, password);
        if (user) {
            res.send(`User ${username} logged in successfully`);
        }
        else {
            res.status(404).send('User not found or incorrect password');
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// 启动服务器
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
