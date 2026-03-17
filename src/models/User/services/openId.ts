import { Request, Response } from "express";
import { resSuccess, resBadRequest, resError } from "@/utils/res";
import User from "../index";
import UserService from "./userService";
import axios from "axios";

/**
 * 调用微信API获取session_key和openid
 * @param code 微信登录凭证code
 * @returns 微信API返回的结果
 */
async function getWxSession(code: string) {
    const appid = process.env.WX_APPID;
    const secret = process.env.WX_SECRET;
    
    if (!appid || !secret) {
        throw new Error("缺少微信小程序配置信息");
    }
    
    const url = "https://api.weixin.qq.com/sns/jscode2session" +
        "?appid=" + appid + "&secret=" + secret +
        "&js_code=" + code + "&grant_type=authorization_code;";
    
    const response = await axios.get(url);
    
    if (response.data.errcode) {
        throw new Error(`微信API调用失败: ${response.data.errmsg}`);
    }
    
    return response.data;
}

/**
 * 微信OpenId登录
 * @param req Express请求对象
 * @param res Express响应对象
 */
async function OpenIdLogin(req: Request, res: Response) {
    const { code } = req.body;
    
    if (!code) {
        return resBadRequest(res, "缺少code参数");
    }
    
    try {
        // 调用微信API获取session_key和openid
        const wxResult = await getWxSession(code);
        const { openid, session_key } = wxResult;
        
        if (!openid || !session_key) {
            return resError(res, 400, "微信登录失败，缺少必要参数");
        }
        
        // 检查用户是否已存在
        const userId = await UserService.getUserId(openid);
        if (!userId) {
            // 用户不存在，创建新用户
            const registerResult = await User.register(openid, session_key);
            return resSuccess(res, registerResult, "注册成功");
        }
        
        // 用户已存在，更新session_key并返回登录结果
        const loginResult = await User.login(userId, session_key);
        return resSuccess(res, loginResult, "登录成功");
    } catch (error) {
        console.error("OpenId登录失败:", error);
        return resError(res, 500, `登录失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export default OpenIdLogin;