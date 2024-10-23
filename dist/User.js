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
const db_1 = __importDefault(require("./db"));
//user库，用于写与用户有关的数据库操作
class User {
    // 注册方法，接受用户凭据作为参数，并返回生成的用户 ID。
    static register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // 执行 SQL 插入命令，并将结果存储在 results 变量中。
            // 使用 NOW() 函数自动设置注册时间。
            const [results] = yield db_1.default.execute('INSERT INTO users (username, password, register_time) VALUES (?, ?, NOW())', [user.username, user.password]);
            // 返回插入操作生成的自增 ID。
            return results[0].insertId;
        });
    }
    //登录方法
    static login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // 使用 db.execute 执行 SQL 查询命令
            // 查询用户名和密码匹配的用户信息
            const [rows] = yield db_1.default.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
            // 返回查询结果的第一行，如果没有找到用户，则返回 undefined
            return rows[0];
        });
    }
}
//將user类型到处给他人使用呃呃
exports.default = User;
