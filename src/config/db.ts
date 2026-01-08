import { connect, connection } from "mongoose";

const connectionOptions = { serverSelectionTimeoutMS: 30000 , // 服务器选择超时时间
    socketTimeoutMS: 45000, // 套接字超时时间
    connectTimeoutMS: 30000, // 连接超时时间
    maxPoolSize: 50, // 最大连接池大小
    minPoolSize: 10, // 最小连接池大小
};

// 连接数据库
async function connectToDatabase() {
    const maxConnectAttempts = 5;
    let attempts = 0;
    
    const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bysks.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
    
    async function attemptConnection() {
        attempts++;
        
        try {
            await connect(url, connectionOptions);
            console.log("MongoDB连接成功");
            
            // 处理索引
            try {
                const userCollection = connection.db.collection("users");
                await userCollection.dropIndex("email_1");
                await userCollection.dropIndex("phone_1");
                console.log("已删除旧索引");
            } catch (error) {
                // 如果索引不存在，忽略错误
                console.log("索引处理完成或不存在旧索引");
            }
        } catch (error) {
            console.error(`MongoDB连接失败 (尝试 ${attempts}/${maxConnectAttempts}):`, error);
            
            if (attempts < maxConnectAttempts) {
                console.log("5秒后重试连接...");
                setTimeout(attemptConnection, 5000);
            } else {
                console.error("MongoDB连接失败，已达到最大重试次数");
                process.exit(1);
            }
        }
    }
    
    await attemptConnection();
}

export default connectToDatabase;