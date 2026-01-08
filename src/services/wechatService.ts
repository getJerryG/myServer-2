import axios from "axios";
import RedisCacheManager from "@/utils/redisCache";
import crypto from "crypto";

/**
 * 生成微信会话签名
 * @param sessionKey 微信会话密钥
 * @returns 生成的签名
 */
function generateSignature(sessionKey: string): string {
    if (!sessionKey) {
        throw new Error("Session_key is required");
    }
    
    const hmac = crypto.createHmac("sha256", sessionKey);
    const signature = hmac.update("").digest("hex");
    
    return signature;
}

/**
 * 获取微信会话信息
 * @param code 微信登录凭证
 * @returns 包含openid、session_key和unionid的对象
 */
export async function getWechatSession(code: string): Promise<{ openid: string; session_key: string; unionid?: string }> {
    try {
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WX_APPID}&secret=${process.env.WX_SECRET}&js_code=${code}&grant_type=authorization_code`;
        const response = await axios.get(url);
        const { openid, session_key, unionid } = response.data;
        
        return { openid, session_key, unionid };
    } catch (error) {
        console.error("获取微信会话失败:", error);
        throw error;
    }
}

/**
 * 获取微信全局唯一后台接口调用凭据access_token
 * @returns access_token
 */
async function getAccessToken(): Promise<string> {
    let access_Info: { access_token: string; expires_in: number; time: number } | null = null;
    
    try {
        access_Info = await RedisCacheManager.get("access_token") as any;
        
        // 检查access_token是否存在且未过期
        if (access_Info && access_Info.access_token && Date.now() < access_Info.time + access_Info.expires_in * 1000 - 60000) {
            return access_Info.access_token;
        }
        
        // 从微信服务器获取新的access_token
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.WX_APPID}&secret=${process.env.WX_SECRET}`;
        const res = await axios.get(url);
        const { access_token, expires_in } = res.data;
        
        // 缓存access_token
        const now = Date.now();
        const newAccessInfo = { access_token, expires_in, time: now };
        await RedisCacheManager.set("access_token", newAccessInfo, expires_in - 60);
        
        return access_token;
    } catch (error) {
        console.error("获取微信access_token失败:", error);
        throw error;
    }
}

/**
 * 检查微信会话是否有效
 * @param session_key 微信会话密钥
 * @param openid 用户openid
 * @returns 会话是否有效
 */
export async function checkSession(session_key: string, openid: string): Promise<boolean> {
    try {
        const access_token = await getAccessToken();
        const sig_method = "hmac_sha256";
        const signature = generateSignature(session_key);
        
        const url = `https://api.weixin.qq.com/wxa/checksession?access_token=${encodeURIComponent(access_token)}&signature=${signature}&openid=${openid}&sig_method=${sig_method}`.replace(/\s/g, "");
        const res = await axios.get(url);
        
        return res.data.errcode === 0;
    } catch (error) {
        console.error("检查微信会话失败:", error);
        return false;
    }
}