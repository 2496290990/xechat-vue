import moment from "moment"

// 输出帮助文档
export function helpMd() {
    return `
# 1. 命令列表 & 触发命令前缀 #


> Tips: "{ }"表示输入参数占位符，"[ ]"内的参数为可选参数，所有参数均以空格分隔。

| 序号 | 命令        | 描述               | 状态 | 参数及示例                                                   |
| ---- | ----------- | ------------------ | ---- | ------------------------------------------------------------ |
| 1    | #login      | 登录               | √   | 参数：#login {昵称}[-s {鱼塘编号 } -h {服务端IP} -p {服务端端口} -c (清理缓存)] |
| 2    | #showServer | 鱼塘列表           | √   | #showServer [-c（清理缓存)]                                  |
| 3    | #showStatus | 查看可用状态       | ×    |                                                              |
| 4    | #setStatus  | 设置状态           | ×    | #setStatus {状态值}                                          |
| 5    | #showGame   | 游戏列表           | ×    |                                                              |
| 6    | #play       | 游戏功能           | ×    | #play {游戏编号}                                             |
| 7    | #join       | 加入游戏\\拒绝邀请 |× |     |
| 8    | #open       | 打开工具           | ×    | #open [{工具编号}]                                           |
| 9    | #over       | 结束游戏\\工具 |×     |     |
| 10   | #showMode   | 查看模式选项       | ×    |                                                              |
| 11   | #mode       | 模式设置           | ×    | #mode {模式编号}                                             |
| 12   | #weather    | 天气查询           | ×    | #weather {地名，如：北京市} [-d {0：当前，默认               |
| 13   | #notify     | 消息通知           | ×    | 1.正常通知 2.隐晦通知 3关闭通知                              |
| 14   | #alive      | 活着               | ×    | 0.关闭｜1.开启                                               |
| 15   | #moyu       | 摸鱼办生成         | ×    |                                                              |
| 16   | #admin      | 管控               | ×    |                                                              |
| 17   | #exit       | 退出               | √  |                                                              |
| 18   | #clean      | 清屏               | √   |                                                              |
| 19   | #help       | 帮助               | √   ||
|20  |#showSSQ|随机双色球|√|#showSSQ {生成数量}(不输入默认1个)|
|21 |#showDLT|随机大乐透|√|#showDLT {随机数量}(不输入默认1个)|
|22 |#showImage|展示图片|√|#showImage {下标|last}(last或者不输入为最后一张图片)|
|23 |#cleanImage|清空图片|√|#cleanImage|      
`
}

export function emoji() {
    return `
:smile: :a:        
    `
}

export function serverList() {
    return `
| 序号 | 名称     | ip                        | 端口  |
| ---- | -------- | ------------------------- | ----- |
| 0    | 官方魚塘 | xechat.xeblog.cn          | 33858 |
| 1    | 有鱼溪   | 47.96.115.18              | 1024  |
| 2    | 光之乐园 | zhangruoyu.top            | 1024  |
| 3    | 充电鸭   | chargeduck.lesscoding.net | 1024  |    
    `
}

export function getDateStr() {
    
}

export function getSysTitle(nickname) {
    const currentDate = new Date();
    // 使用 moment.js 进行日期格式化
    const dateStr =  moment(currentDate).format('yyyy-MM-DD HH:mm:ss');
    return `
**${dateStr} ${nickname} :**\n
    `
}

export function cmdTips() {
    const hintTips = [
        "#login {昵称}[-s {鱼塘编号 } -h {服务端IP} -p {服务端端口} -c (清理缓存) "
    ]
    return hintTips;
}

