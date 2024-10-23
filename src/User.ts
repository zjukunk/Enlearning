import db from './db';

//定义一个接口
interface UserCredentials {
  username: string;
  password: string;
}

//user库，用于写与用户有关的数据库操作
class User {


  // 注册方法，接受用户凭据作为参数，并返回生成的用户 ID。
  static async register(user: UserCredentials): Promise<number> {
    // 执行 SQL 插入命令，并将结果存储在 results 变量中。
    // 使用 NOW() 函数自动设置注册时间。
    const [results] = await db.execute(
      'INSERT INTO users (username, password, register_time) VALUES (?, ?, NOW())',
      [user.username, user.password]
    );
    // 返回插入操作生成的自增 ID。
    return results[0].insertId;
  }

  //登录方法
  static async login(username: string, password: string): Promise<any> {
    // 使用 db.execute 执行 SQL 查询命令
    // 查询用户名和密码匹配的用户信息
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    // 返回查询结果的第一行，如果没有找到用户，则返回 undefined
    return rows[0];
  }
}

//將user类型到处给他人使用呃呃
export default User;