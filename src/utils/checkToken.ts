import jwt from "jsonwebtoken";

export default function checkToken(token: string): jwt.JwtPayload | string | Error {
    if (!token) {
        throw new Error("令牌不能为空");
    }

    // 从Bearer token中提取实际令牌
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        throw new Error("令牌格式无效");
    }

    const actualToken = tokenParts[1];

    try {
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET as jwt.Secret);
        return decoded as jwt.JwtPayload;
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            throw new Error("令牌无效");
        }
        throw new Error("令牌验证失败");
    }
}