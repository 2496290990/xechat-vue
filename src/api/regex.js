import { isBlank, isNotBlank } from "@/util/str";

export function cmdHandler(content, that) {
    if(content.startsWith('#')) {
        if(content.startsWith('#login')) {
            getlogin(content)
        }
    } else {
        console.log(content, that);
    }
}

export function getlogin(content) {
    // 定义正则表达式
    // const regex = /#login\s+(\w+)\s+-s\s+(\d+)\s+-h\s+(\w+)\s+-p\s+(\d+)/;
    // const regex = /#login\s+(\w+)(?:\s+-s\s+(\d+))?(?:\s+-h\s+(\w+))?(?:\s+-p\s+(\d+))?/;
    const regex = /#login\s+(\w+)(?:\s+-s\s+(\d+))?(?:\s+-h\s+([\w.]+))?(?:\s+-p\s+(\d+))?/;
    const matches = content.match(regex);

    // 提取匹配的值
    let username = "";
    let server = "";
    let host = "";
    let port = "";

    if (matches) {
        username = matches[1];
        server = matches[2];
        host = matches[3];
        port = matches[4];
    }
    // 输出结果
    console.log(`username=${username}, server=${server}, host=${host}, port=${port}`);
    let data = {
        username,
        url: '',
        errorMsg: ''
    }
    if (isBlank(username)) {
        data.errorMsg = '用户名不允许为空;'
        return data
    }
    if (isNotBlank(server)) {
        const serverIndex = Number(server)
        console.log(`当前服务器地址为${serverIndex}`);
        const serverList = getServerList();
        if (serverIndex < 0 || serverIndex > serverList.length) {
            data.errorMsg += `服务下标获取失败`
        }
        const wsServer = serverList[serverIndex]
        data.url = `ws://${wsServer.ip}:${wsServer.port + 1}/xechat`
        return data
    }
    if (isBlank(host) && isBlank(port)) {
        console.log(`当前服务器地址为ws://localhost:1025/xechat`);
        data.url = 'ws://localhost:1025/xechat'
        return data
    }
    if (isNotBlank(host)) {
        if (isNotBlank(port)) {
            console.log(`当前服务器地址为ws://${host}:${port}/xechat`);
            data.url = `ws://${host}:${port}/xechat`
        } else {
            console.log(`当前服务器地址为ws://${host}:1025/xechat`);
            data.url = `ws://${host}:1025/xechat`
        }
        return data
    }

    if (isNotBlank(port)) {
        if (isNotBlank(host)) {
            console.log(`当前服务器地址为ws://${host}:${port}/xechat`);
            data.url = `ws://${host}:${port}/xechat`
        } else {
            console.log(`当前服务器地址为ws://localhost:${port}/xechat`);
            data.url = `ws://localhost:${port}/xechat`
        }
        return data
    }
}

export function getServerList() {
    let serverList = []
    serverList.push({
        name: '官方魚塘',
        ip: '103.153.101.174',
        port: 33858
    })
    serverList.push({
        name: '有鱼溪',
        ip: '47.96.115.18',
        port: 1024
    })
    serverList.push({
        name: '光之乐园',
        ip: 'zhangruoyu.top',
        port: 1024
    })
    serverList.push({
        name: '充电鸭',
        ip: 'chargeduck.lesscoding.net',
        port: 1024
    })
    return serverList
}
