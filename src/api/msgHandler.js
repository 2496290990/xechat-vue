import { v4 as uuidv4 } from 'uuid';

export function dataToJson(data) {
    return JSON.stringify(data)
}

export function addNewLine(msg) {
    return `

${msg}    
`
}

export function chatJson(sendMsg){
    let data = {
        action: 'CHAT',
        body: {
            'content': sendMsg,
            'msgType': 'TEXT',
            'toUsers': ['张三']
        }
    }
    return dataToJson(data)
}

export function loginJson(username) {
    let data = {
        action: 'LOGIN',
        body: {
            username: username,
            status: 'FISHING',
            reconnected: false,
            pluginVersion: '',
            token: '111',
            uuid: uuidv4(),
            platform: 'WEB'
        },
    }
    return dataToJson(data)
}