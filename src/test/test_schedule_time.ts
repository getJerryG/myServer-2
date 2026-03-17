// 测试赛程时间验证的脚本
// 这个脚本会被打包到dist/bundle.js中执行
// 所以不需要单独运行，会自动随服务器启动执行
console.log("开始测试赛程时间验证...");

// 获取当前时间和7天后的时间
const now = new Date();
const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
console.log("\n当前时间:", now);
console.log("7天后时间:", sevenDaysLater);
console.log("时间戳:", now.getTime());
console.log("7天后时间戳:", sevenDaysLater.getTime());
console.log("时间差:", (sevenDaysLater.getTime() - now.getTime()) / (1000 * 60 * 60 * 24), "天");