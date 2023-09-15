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

/**
 * 获取命令后紧跟着的数字参数 超过maxIndex的话默认返回maxIndex
 * @param {string} content 
 * @param {Number} maxIndex 
 */
export function getNumberParam(content, maxIndex) {
    const params = content.split(' ')
    if(params.length == 1) {
        return 0
    }
    const param = params[1]
    if(isNaN(param) || Number(param) < 0) {
        return 0
    }
    if(Number(param) >= maxIndex) {
        return maxIndex
    }
    return Number(param)
}

/**
 * 获取展示用的字符串
 * @param {string} content 
 */
export function getShowImgStr(content, imageList) {
    let params = content.split(' ')
    const data = {
        indexes: [0],
        blur: 0,
        force: content.indexOf('-f') != -1,
        zoom: 100,
        errorMsg: ''
    }

    if (params.length == 1) {
        if(imageList.length == 0 ) {
            data.errorMsg = '暂无图片'
        } else {
            data.indexes = [imageList.length - 1]
        }
        return data
    } 
    // 到这一步params的长度肯定大于 2 
    const indexes =  getParam(params, "-i")
    const blur = getParam(params, '-b')
    const zoom = getParam(params, '-z')
    if (isNotBlank(zoom)) {
        data.zoom = strToNumberRange(zoom, 0 , 100)
    }
    // 索引和模糊度都为空 直接去下标为1的当成index
    // 展示多条图片的话用,隔开
    if (isBlank(indexes) && isBlank(blur)) {
        data.indexes = params[1].split(',')
    }
    if (isNotBlank(indexes)) {
        data.indexes = indexes.split(',')
    }
    if (isNotBlank(blur)) {
        if (isNaN(blur)) {
            data.errorMsg = '模糊程度有误，仅支持 0 -10'
        } else {
            data.blur = strToNumberRange(blur, 0 , 10)
        }
    }
    return data
}
/**
 * 
 * @param {string} str 
 * @param {Number} min 
 * @param {Number} max 
 * @returns Number 将字符串转换成一个 [min,max]区间的数
 */
export function strToNumberRange(str, min, max) {
    return Math.max(min, Math.min(max, Number(str)))
}
