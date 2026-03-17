import { Request, Response, NextFunction } from "express";

const ALLOWED_ORIGINS = "*";
const ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization, X-Requested-With";
const ALLOW_CREDENTIALS = "true";

const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || ALLOWED_ORIGINS);
    res.header("Access-Control-Allow-Methods", ALLOWED_METHODS);
    res.header("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    res.header("Access-Control-Allow-Credentials", ALLOW_CREDENTIALS);

    // 处理 OPTIONS 预检请求
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    next();
};

export default corsMiddleware;