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
                    @keydown.enter.native="handleEnterKeyDown"
                    v-model='chatMsg'
                    style='margin-top: 10px;'
                />
                <el-tooltip effect="dark" :content="getHint()" placement="top" v-if="showTooltip">
                    <div v-for="(item, index) in hintList" :key="index" :class="{ 'highlighted': index === highlightedIndex }" @click="fillInput(item)">
                        {{ item }}
                    </div>
                </el-tooltip>
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
import {isBlank, isNotBlank} from '@/util/str'
import { chatJson, loginJson, addNewLine } from '@/api/msgHandler'
import { generateSSQ, generateDLT } from '@/api/random'

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
            wsUrl: 'ws://localhost:1025/xechat',
            imagePath: 'http://localhost:1025/download/',
            onlineUsers: [],
            hintList: ['#login', '#exit'], // List of hints
            showTooltip: false,
            highlightedIndex: -1,
            imageList:[]
        }
    },
    created() {
        this.showHelp()
    },
    watch: {
      inputValue(newVal) {
        this.showTooltip = (newVal.startsWith('#') || newVal.indexOf('@') != -1) && !newVal.endsWith(' ')
        if (newVal.indexOf('@') != -1) {
            this.hintList = this.onlineUsers
        }
      }
    },
    methods: {
        handleEnterKeyDown(event) {
            event.preventDefault();
            console.log('Enter key down');
            if (this.highlightedIndex !== -1) {
                this.fillInput(this.hintList[this.highlightedIndex].split(' ')[0]);
            }
            if (!this.showTooltip && isNotBlank(this.chatMsg)) {
                this.chatSend()
            }
        },
        handleArrowUpKeyDown(event) {
            event.preventDefault();
            this.highlightedIndex = Math.min(this.hintList.length - 1, this.highlightedIndex + 1);
        },
        handleArrowUpKeyDonw(event) {
            event.preventDefault();
            this.highlightedIndex = Math.max(0, this.highlightedIndex - 1);
        },
        getHint() {
            if (this.inputValue === '#') {
                this.showTooltip = true;
                return '';
            }
            this.showTooltip = false;
            return '';
        },
        fillInput(item) {
            this.inputValue = item;
            this.showTooltip = false;
            this.highlightedIndex = -1;
        },
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
                this.imagePath = loginData.imagePath
                this.connect(this.username)
                return
            }
            if (inputMsg.startsWith('#help')) {
                this.showHelp()
                return
            }
            if (inputMsg.startsWith('#exit')) {
                this.socket.close()
                this.msg += addNewLine('哎呦，你干嘛~~')
                this.msg += addNewLine('已退出登录！')
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
            // 展示图片
            if (inputMsg.startsWith('#showImage')) {
                let params = inputMsg.split(' ')
                // 直接输入 showImage 展示最后一条图片消息
                if(params.length == 1) {
                   const imageUrl = this.imageList[this.imageList.length - 1]
                   this.msg += addNewLine(`![${imageUrl}](${imageUrl})`)
                }
                if(params.length > 1) {
                    params = params.spice(1)
                    for(let item of params) {
                        if(item == 'last') {
                            const imageUrl = this.imageList[this.imageList.length - 1]
                            this.msg += addNewLine(`![${imageUrl}](${imageUrl})`)
                        } else if (isNaN(item)) {
                            this.msg += addNewLine(`索引错误`)
                        } else {
                            let index = Number(item)
                            if(index < 0) {
                                index = 0;
                            }
                            if(index >= this.imageList.length) {
                                index = this.imageList.length - 1
                            }
                            const imageUrl = this.imageList[this.imageList.length - 1]
                            this.msg += addNewLine(`![${imageUrl}](${imageUrl})`)
                        }
                    }

                }
            }
            // 清空图片缓存
            if (inputMsg.startsWith('#cleanImage')) {
                this.imageList = []
                this.msg += addNewLine('图片列表已清空')
            }
            // 随机双色球
            if (inputMsg.startsWith('#showSSQ')) {
                let params = inputMsg.split(' ')
                let cycle = 1;
                if (params.length == 1) {
                    cycle = 1;
                } else {
                    let numStr = params[1]
                    if (isNaN(numStr)) {
                        cycle = 1
                    } else {
                        cycle = Number(numStr)
                    }
                }
                for (let i = 1; i <= cycle; i++) {
                    const data = generateSSQ()
                    let chatMsg = ''
                    chatMsg += addNewLine(`随机双色球结果:`)
                    chatMsg += addNewLine(`红球：${data.redBalls} 蓝球 ${data.blueBall}`)
                    this.sendMsg(chatJson(chatMsg))
                }
                this.msg += addNewLine(``)
            }
            // 随机双色球
            if (inputMsg.startsWith('#showSSQ')) {
                let params = inputMsg.split(' ')
                let cycle = 1;
                if (params.length == 1) {
                    cycle = 1;
                } else {
                    let numStr = params[1]
                    if (isNaN(numStr)) {
                        cycle = 1
                    } else {
                        cycle = Number(numStr)
                    }
                }
                for (let i = 1; i <= cycle; i++) {
                    const data = generateDLT()
                    let chatMsg = ''
                    chatMsg += addNewLine(`随机双色球结果:`)
                    chatMsg += addNewLine(`红球：${data.redBalls} 蓝球 ${data.blueBall}`)
                    this.sendMsg(chatJson(chatMsg))
                }
                this.msg += addNewLine(``)
            }
        },
        showSysMsg() {
            this.msg += getSysTitle('系统消息')
        },
        getDateStr() {
            const date = new Date()
            return date.toLocaleDateString()
        },
        connect(username) {
            this.socket = new WebSocket(this.wsUrl);
            const that = this
            this.socket.onopen = function() {
                that.msg += addNewLine('**WebSocket Connect Success!**')
                that.doLogin(username)
            }
            this.socket.onmessage = function(event) {
                console.log(event);
                that.onWsMessage(event);
            }
            this.socket.onclose = function() {
                that.msg += addNewLine('**WebSocket Closed!**')
            }
        },
        doLogin(username) {
            let loginName = isBlank(username) ? this.username : username;
            if(this.checkStatus()) {
                this.heartBeat();
                this.sendMsg(loginJson(loginName));
            }
        },
        doChat(msg) {
            let content = ''
            if (isNotBlank(msg)) {
                content = msg
            }
            if (isNotBlank(this.inputMsg)) {
                content = this.inputMsg
            }
            const data = {
                'action': 'CHAT',
                'body': {
                    'content': content,
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
                console.log(data)
                this.singletonMsg(data)
            }
            
        },
        // 处理单条消息
        singletonMsg(data) {
            if(data.type == 'SYSTEM') {
                this.msg += addNewLine(`**${data.time}【系统消息】${data.body}**`)
            }
            // 处理用户消息
            if(data.type == 'USER') {
                const body = data.body
                let content = body.content
                if (body.msgType == 'IMAGE') {
                    const imageUrl = `${this.imagePath}${content}`
                    this.imageList.push(imageUrl)
                    // 防止有人发黄土
                    // content = `![${content}](${this.imagePath}${content})`
                    content = `图片消息谨慎打开:: 当前索引 ::${this.imageList.indexOf(imageUrl)} :: ${imageUrl}`
                }
                this.msg += addNewLine(`${data.time}[${data.user.region.city}:${data.user.region.isp} ${data.user.username}]: ${content}`)
                if(body.toUsers != undefined && body.toUsers.length > 0) {
                    // todo
                    let atMe = body.toUsers.indexOf(this.username) != -1
                    if(atMe) {
                        this.$alert(`${content}`, `${data.user.username}`, {
                            dangerouslyUseHTMLString: true
                        });
                    }
                }
            }
            // 处理在线用户消息
            if (data.type == 'ONLINE_USERS') {
                const userList = data.body.userList
                userList.map(item => this.onlineUsers.push(item.username))
                console.log('当前在线用户', this.onlineUsers)
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
        }
    }
}
</script>
<style>
.el-main {
    background-color: #E9EEF3;
    color: #333;
    line-height: 160px;
}
.viewer{
    text-align: left;
}
.highlighted {
  background-color: yellow;
}
</style>
