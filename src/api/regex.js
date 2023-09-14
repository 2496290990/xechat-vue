import { isBlank, isNotBlank } from "@/util/str";

export function getlogin(content) {
    // // 定义正则表达式
    // // const regex = /#login\s+(\w+)\s+-s\s+(\d+)\s+-h\s+(\w+)\s+-p\s+(\d+)/;
    // // const regex = /#login\s+(\w+)(?:\s+-s\s+(\d+))?(?:\s+-h\s+(\w+))?(?:\s+-p\s+(\d+))?/;
    // // 不支持中文
    // // const regex = /#login\s+(\w+)(?:\s+-s\s+(\d+))?(?:\s+-h\s+([\w.]+))?(?:\s+-p\s+(\d+))?/;
    // const regex = /#login\s+([\u4e00-\u9fa5\w]+)(?:\s+-s\s+(\d+))?(?:\s+-h\s+([\w.]+))?(?:\s+-p\s+(\d+))?/;
    // const matches = content.match(regex);
    const params = content.split(' ')
    // 提取匹配的值
    let username = getParam(params, '#login');
    let server = getParam(params, '-s');
    let host = getParam(params, '-h');
    let port = getParam(params, '-p');

    // 输出结果
    console.log(`username=${username}, server=${server}, host=${host}, port=${port}`);
    let data = {
        username,
        url: '',
        errorMsg: '',
        imagePath: ''
    }
    if (isBlank(username)) {
        data.errorMsg = '用户名不允许为空;'
        return data
    }

    if(isBlank(server) && isBlank(host) && isBlank(port)) {
        server = 0
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
        data.imagePath = `http://${wsServer.ip}:${wsServer.port + 1}/download/`
        return data
    }
    if (isBlank(host) && isBlank(port)) {
        console.log(`当前服务器地址为ws://localhost:1025/xechat`);
        data.url = 'ws://localhost:1025/xechat'
        data.imagePath = `http://localhost:1025/download/`
        return data
    }
    if (isNotBlank(host)) {
        if (isNotBlank(port)) {
            console.log(`当前服务器地址为ws://${host}:${port}/xechat`);
            data.url = `ws://${host}:${port}/xechat`
            data.imagePath = `http://${host}:${port}/download/`
        } else {
            console.log(`当前服务器地址为ws://${host}:1025/xechat`);
            data.url = `ws://${host}:1025/xechat`
            data.imagePath = `http://${host}:1025/download/`
        }
        return data
    }

    if (isNotBlank(port)) {
        if (isNotBlank(host)) {
            console.log(`当前服务器地址为ws://${host}:${port}/xechat`);
            data.url = `ws://${host}:${port}/xechat`
            data.imagePath = `http://${host}:${port}/download/`
        } else {
            console.log(`当前服务器地址为ws://localhost:${port}/xechat`);
            data.url = `ws://localhost:${port}/xechat`
            data.imagePath = `http://localhost:${port}/download/`
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

export function getParam(params, param) {
    let index = params.indexOf(param);
    if (index !== -1) {
        return params[index + 1];
    }
    return null;
}
