import cors, { CorsOptions } from "cors";
import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import usersRoutes from "./routes/userRoutes";
import recordRoutes from "./routes/RocordRoutes";
import monitorRoutes from "./routes/monitorRoutes";
import showImageRoutes from "./routes/showImgRoutes";
import wekfareRoutes from "./routes/wekfareRoutes";
import openIdRoutes from "./routes/openId";
import uploadRoutes from "./routes/uploadRoutes";
import contestRoutes from "./routes/contest";
import clanRoutes from "./routes/clanRoutes";
import currencyRoutes from "./routes/currencyRoutes";
import adminRoutes from "./routes/Admin";
import goodsRoutes from "./routes/goodsRoutes";
import titleRoutes from "./routes/titleRoutes";
import contestAdminRoutes from "./routes/contest/contestAdminRoutes";

const corsOptions: CorsOptions = {
    origin: [
        "http://localhost:3000", 
        "http://localhost:8080", 
        "http://localhost:5500", 
        "https://your-production-domain.com"
    ],
    credentials: true, // 允许携带cookie
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-time"]
};

const app = express();

// 配置请求频率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP最多100个请求
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors(corsOptions)); // 启用CORS
app.use(limiter); // 应用请求频率限制
// app.use(maintenance); // 使用维护中间件
app.use(bodyParser.json()); // 解析JSON请求体

app.get("/", (_, res) => {
    res.send("Hello!");
});



// 1. 基础服务模块
app.use("/api/monitor", monitorRoutes);
app.use("/upload", uploadRoutes);

// 2. 认证模块
app.use("/openid", openIdRoutes);
app.use("/admin", adminRoutes);

// 3. 用户管理模块
app.use("/users", usersRoutes);
app.use("/title", titleRoutes);

// 4. 赛事管理模块
app.use("/contest", contestRoutes);
app.use("/api/contest-admin", contestAdminRoutes);

// 5. 社区/群组模块
app.use("/clan", clanRoutes);

// 6. 货币/经济系统模块
app.use("/currency", currencyRoutes);
app.use("/goods", goodsRoutes);

// 7. 福利/活动模块
app.use("/wekfare", wekfareRoutes);

// 8. 媒体服务模块
app.use("/show", showImageRoutes);

// 9. 记录模块
app.use("/records", recordRoutes);



// 11. 其他模块
// ...

//导出app
export default app;