import { Server as SocketServer } from "socket.io";
import EventEmitter from "events";

/**
 * Socket.IO服务器类
 * 继承自EventEmitter，用于管理Socket.IO连接
 */
class Server extends EventEmitter {
    #io: SocketServer;
    #player: Set<any> = new Set(); // 存储玩家集合
    #server: any;

    /**
     * 构造函数
     * @param server HTTP服务器实例
     */
    constructor(server: any) {
        super();
        this.#server = server;
        this.#init();
    }

    /**
     * 获取玩家集合
     * @returns 玩家集合
     */
    get player() {
        return this.#player;
    }

    /**
     * 设置玩家集合
     * @param player 玩家集合
     */
    set player(player: Set<any>) {
        this.#player = player;
    }

    /**
     * 获取Socket.IO实例
     * @returns Socket.IO实例
     */
    get io() {
        return this.#io;
    }

    /**
     * 初始化方法
     */
    #init() {
        this.#init_IO(); // 初始化Socket.IO
    }

    /**
     * 初始化Socket.IO
     */
    #init_IO() {
        this.#io = new SocketServer(this.#server, {
            allowEIO3: true, // 允许Socket.IO 3.x客户端连接
            cors: {
                origin: "*", // 允许所有来源
                methods: ["GET", "POST"], // 允许的HTTP方法
                credentials: true, // 允许携带Cookie
                allowedHeaders: ["Content-Type", "Authorization"], // 允许的HTTP头
                preflightContinue: false, // 不继续处理OPTIONS请求
                optionsSuccessStatus: 204, // OPTIONS请求成功状态码
                maxAge: 3600 // CORS预检请求结果缓存时间
            },
            path: "/socket.io", // Socket.IO路径
            transports: ["websocket", "polling"], // 支持的传输方式
            cookie: true // 启用Cookie
        });

        // 监听连接事件
        this.#io.on("connection", (socket) => {
            console.log("新的Socket连接:", socket.id);

            // 监听断开连接事件
            socket.on("disconnect", () => {
                console.log("Socket断开连接:", socket.id);
            });
        });
    }
}

export default Server;