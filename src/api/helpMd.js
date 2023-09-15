import moment from "moment"

// 输出帮助文档
export function helpMd() {
    return `
# 1. 命令列表 & 触发命令前缀 #


> Tips: "{ }"表示输入参数占位符，"[ ]"内的参数为可选参数，所有参数均以空格分隔。

- 已实现的命令

| 序号 | 命令        | 描述               | 状态 | 参数及示例                                                   |
| ---- | ----------- | ------------------ | ---- | ------------------------------------------------------------ |
| 1    | #login      | 登录               | √   | 参数：#login {昵称}[-s {鱼塘编号 } -h {服务端IP} -p {服务端端口} -c (清理缓存)] |
| 2    | #showServer | 鱼塘列表           | √   | #showServer [-c（清理缓存)]                                  |
| 3   | #exit       | 退出               | √  |                                                              |
| 4   | #clean      | 清屏               | √   |                                                              |
| 5   | #help       | 帮助               | √   ||
| 6  |#showSSQ|随机双色球|√|#showSSQ {生成数量}(不输入默认1个)|
| 7 |#showDLT|随机大乐透|√|#showDLT {随机数量}(不输入默认1个)|
| 8 |#showImage|展示图片|√|#showImage {下标 多个用,隔开}<br/> #showImage -i {图片下标，多个用,隔开} -z {缩放比例 0-100默认100} -b {模糊程度 0-10} -f (强制切换v-md-editor展示图片) |
| 9 |#cleanImage|清空图片|√|#cleanImage| 
| 10 |#changeEditor|切换markdown编辑器|√|#changeEditor {编号 0\\|1} 0 byteMd 掘金同款 1 v-md-editor 支持文字颜色展示和图片缩放模糊| 

- 暂未实现的命令

| 序号 | 命令        | 描述               | 状态 | 参数及示例                                                   |
| ---- | ----------- | ------------------ | ---- | ------------------------------------------------------------ |
| 1    | #showStatus | 查看可用状态       | ×    |                                                              |
| 2    | #setStatus  | 设置状态           | ×    | #setStatus {状态值}                                          |
| 3    | #showGame   | 游戏列表           | ×    |                                                              |
| 4    | #play       | 游戏功能           | ×    | #play {游戏编号}                                             |
| 5    | #join       | 加入游戏\\拒绝邀请 |× |     |
| 6    | #open       | 打开工具           | ×    | #open [{工具编号}]                                           |
| 7    | #over       | 结束游戏\\工具 |×     |     |
| 8   | #showMode   | 查看模式选项       | ×    |                                                              |
| 9   | #mode       | 模式设置           | ×    | #mode {模式编号}                                             |
| 10   | #weather    | 天气查询           | ×    | #weather {地名，如：北京市} [-d {0：当前，默认               |
| 11   | #notify     | 消息通知           | ×    | 1.正常通知 2.隐晦通知 3关闭通知                              |
| 12   | #alive      | 活着               | ×    | 0.关闭｜1.开启                                               |
| 13   | #moyu       | 摸鱼办生成         | ×    |                                                              |
| 14   | #admin      | 管控               | ×    |                                                              |
     
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

export function cmdTips(cmdStr) {
    let hintTips = [
        "#admin 管控",
        "#exit 退出登录",
        "#clean 清屏",
        "#cleanImage 清空图片缓存",
        "#login {昵称}[-s {鱼塘编号 } -h {服务端IP} -p {服务端端口} -c (清理缓存) ",
        "#showServer [-c（清理缓存)]  查看服务器列表",
        "#showStatus 可用状态",
        "#setStatus {状态值} 设置状态",
        "#showSSQ {数量 0-10 非必填} 随机生成双色球 ",
        "#showDLT {数量 0-10 非必填} 随机生成大乐透 ",
        "#showImag (-i) {图片下标，多个用,隔开} -z {缩放比例 0-100默认100} -b {模糊程度 0-10} -f (强制切换v-md-editor展示图片)",
        "#hlep 帮助文档"
    ]
    hintTips = hintTips.filter(item => item.indexOf(cmdStr) != -1)
    return hintTips;
}

