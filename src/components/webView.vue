<template>
    <div>
        <el-container>
            <el-main>
                <Viewer
                class='viewer'
                :tabindex='2'
                :sanitize='23'
                :value='msg'
                :plugins='plugins'
                :locale='zhHans'
                />
            </el-main>
            <el-footer>
                <el-button @click='doChat'>sendMsg</el-button>
                <el-button @click='doLogin'>doLogin</el-button>
                <el-button @click='connect'>Reconnect</el-button>
                <el-input 
                    @keyup.enter.native='chatSend' 
                    v-model='chatMsg'
                    style='margin-top: 10px;'
                />
            </el-footer>
        </el-container>
    </div>
</template>
<script>
// 编辑 / 视图
import { Viewer } from '@bytemd/vue'
import gfm from '@bytemd/plugin-gfm'
import gemoji from '@bytemd/plugin-gemoji'
// 引入中文包
import zhHans from 'bytemd/lib/locales/zh_Hans.json'
// 引入基础css
import 'bytemd/dist/index.min.css'

const plugins = [gfm(), gemoji()];
import { helpMd, serverList,getSysTitle } from '@/api/helpMd'
import { getlogin } from '@/api/regex'
import {isNotBlank} from '@/util/str'
import { chatJson, loginJson, addNewLine } from '@/api/msgHandler'

export default {
    name: 'webView',
    components: {
        Viewer
    },
    data() {
        return {
            // md组件
            plugins: plugins,
            zhHans,
            msg: '',
            socket: null,
            chatMsg: '',
            username: '',
            wsUrl: 'ws://localhost:1025/xechat'
        }
    },
    created() {
        this.showHelp()
    },
    methods: {
        showHelp() {
            this.msg +=  helpMd()
        },
        chatSend() {
            let inputMsg = this.chatMsg
            this.chatMsg = ''
            if(inputMsg.startsWith('#')) {
                this.commandHandler(inputMsg)
            } else {
                this.msg += addNewLine(inputMsg)
                this.sendMsg(chatJson(inputMsg))
            }
        },
        commandHandler(inputMsg){
            if (inputMsg.startsWith('#login')) {
                const loginData = getlogin(inputMsg)
                console.log(loginData);
                if (isNotBlank(loginData.errorMsg)) {
                    this.msg += addNewLine(loginData.errorMsg)
                    return
                }
                this.wsUrl = loginData.url
                this.username = loginData.username
                this.connect()
                console.log(this.socket);
                this.doLogin()
                return
            }
            if (inputMsg.startsWith('#help')) {
                this.showHelp()
                return
            }
            if (inputMsg.startsWith('#exit')) {
                console.log('exit');
                return
            }
            if (inputMsg.startsWith('#clean')) {
                this.msg = `粉身碎骨浑不怕，要留清白在人间 :smile:\n`
                return
            }
            if (inputMsg.startsWith('#showServer')) {
                this.showSysMsg()
                this.msg += serverList()
                return
            }
        },
        showSysMsg() {
            this.msg += getSysTitle('系统消息')
        },
        getDateStr() {
            const date = new Date()
            return date.toLocaleDateString()
        },
        connect() {
            this.socket = new WebSocket(this.wsUrl);
            const that = this
            this.socket.onopen = function() {
                that.msg += addNewLine('**WebSocket Connect Success!**')
                if(isNotBlank(this.username)) {
                    that.doLogin()
                }
            }
            this.socket.onmessage = function(event) {
                console.log(event);
                that.onWsMessage(event);
            }
            this.socket.onclose = function() {
                that.msg += addNewLine('**WebSocket Closed!**')
            }
        },
        doLogin() {
            // eslint-disable-next-line no-debugger
            debugger
            if(this.checkStatus()) {
                this.heartBeat();
                this.sendMsg(loginJson(this.username));
            }
        },
        doChat() {
            const data = {
                'action': 'CHAT',
                'body': {
                    'content': this.inputMsg,
                    'msgType': 'TEXT',
                    'toUsers': ['张三']
                }
            };
            this.sendMsg(data)
        },
        checkStatus() {
            return !(this.socket == null || this.socket.readyState != 1)
        },
        onWsMessage(event) {
            const data = JSON.parse(event.data)
            if(data.type == 'HISTORY_MSG') {
                for(let item of data.body.msgList) {
                    this.singletonMsg(item)
                }
            } else {
                this.singletonMsg(data)
            }
            
        },
        // 处理单条消息
        singletonMsg(data) {
            if(data.type == 'SYSTEM') {
                this.msg += addNewLine(`**${data.time}【系统消息】${data.body}**`)
            }

            if(data.type == 'USER') {
                const body = data.body
                this.msg += addNewLine(`${data.time}[${data.user.username}]: ${body.content}`)
                if(body.toUsers != undefined && body.toUsers.length > 0) {
                    // todo
                    let atMe = body.toUsers.indexOf(this.username) != -1
                    if(atMe) {
                        this.$alert(`${body.content}`, `${data.user.username}`, {
                            dangerouslyUseHTMLString: true
                        });
                    }
                }
            }
        },
        sendMsg(sendMsg) {
            console.log(sendMsg, 'sendMsg');
            this.socket.send(sendMsg)
        },
        // 心跳包 15S发送一次
        heartBeat() {
            const that = this
            const data = {'action': 'HEARTBEAT','body': {}}
            setInterval(() => {
                that.sendMsg(data)
            }, 15000)
        },

    }
}
</script>
<style>
.el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }
</style>
