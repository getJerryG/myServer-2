import { connect, connection } from "mongoose";

// 获取当前环境
const NODE_ENV = process.env.NODE_ENV || "development";

const connectionOptions = {
    serverSelectionTimeoutMS: 30000, // 服务器选择超时时间
    socketTimeoutMS: 45000, // 套接字超时时间
    connectTimeoutMS: 30000, // 连接超时时间
    maxPoolSize: 50, // 最大连接池大小
    minPoolSize: 10, // 最小连接池大小
};

// 根据环境构建数据库连接字符串
// 开发环境：连接本地 MongoDB（DB_ALTER），生产环境：连接 MongoDB Atlas
function buildMongoUrl(): string {
    if (NODE_ENV === "production") {
        return "mongodb+srv://" + process.env["DB_USER"] + ":" + process.env["DB_PASS"] +
            "@cluster0.bysks.mongodb.net/" + process.env["DB_NAME"] +
            "?retryWrites=true&w=majority";
    }
    // 开发环境使用本地连接字符串，兜底默认值
    return process.env["DB_ALTER"] || "mongodb://localhost:27017/myserver";
}

// 连接数据库
async function connectToDatabase() {
    const maxConnectAttempts = 5;
    let attempts = 0;

    const url = buildMongoUrl();

    async function attemptConnection() {
        attempts++;

        try {
            await connect(url, connectionOptions);
            console.log(`MongoDB连接成功，环境: ${NODE_ENV}`);

            // 处理索引
            try {
                const userCollection = connection.db?.collection("users");
                await userCollection?.dropIndex("email_1");
                await userCollection?.dropIndex("phone_1");
                console.log(`已删除旧索引，环境: ${NODE_ENV}`);
            } catch (_error) {
                // 如果索引不存在，忽略错误
                console.log("索引处理完成或不存在旧索引");
            }
        } catch (error) {
            // 统一错误日志格式，保持代码风格一致性
            console.error(`MongoDB连接失败 (尝试 ${attempts}/${maxConnectAttempts}):`, error);

            if (attempts < maxConnectAttempts) {
                console.log("5秒后重试连接...");
                setTimeout(attemptConnection, 5000);
            } else {
                console.error(`MongoDB连接失败，环境: ${NODE_ENV}`);
                process.exit(1);
            }
        }
    }

    await attemptConnection();
}

export default connectToDatabase;