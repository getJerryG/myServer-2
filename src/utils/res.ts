import { Response } from "express";

// 重命名内部的res函数，避免与参数名冲突
const sendResponse = <T = unknown>(code: number, res: Response, data: T, message = ""): void => {
    res.status(code).json({
        code,
        data,
        message,
        timestamp: Date.now(),
    });
};

/** 200 成功响应 */
export const resSuccess = (res: Response, data: unknown, message = ""):void => {
    sendResponse(200, res, data, message);
};

/** 201 创建成功响应 */
export const resCreated = (res: Response, data: unknown, message = ""):void => {
    sendResponse(201, res, data, message);
};

/** 400 错误请求响应 */
export const resBadRequest = (res: Response, message = ""): void => {
    sendResponse(400, res, null, message);
};

/** 401 未授权响应 */
export const resUnauthorized = (res: Response, message = ""): void => {
    sendResponse(401, res, null, message);
};

/** 403 禁止响应 */
export const resForbidden = (res: Response, message = ""): void => {
    sendResponse(403, res, null, message);
};

/** 404 资源未找到响应 */
export const resNotFound = (res: Response, message = ""): void => {
    sendResponse(404, res, null, message);
};

/** 500 内部服务器错误响应 */
export const resInternalServerError = (res: Response, message = ""): void => {
    sendResponse(500, res, null, message);
};

/**
 * 通用错误响应
 * @param res Response对象
 * @param statusCode 状态码
 * @param message 错误消息
 */
export const resError = (res: Response, statusCode: number, message = ""): void => {
    sendResponse(statusCode, res, null, message);
};
