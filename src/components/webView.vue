<template>
    <div>
        <el-container>
            <el-main>
                <Viewer
                  v-show="mdEditor === 'bytemd'"
                  class='viewer'
                  :tabindex='2' 
                  :sanitize='23' 
                  :value='msg' 
                  :plugins='plugins' 
                  :locale='zhHans' 
                />
                <v-md-preview
                    v-show="mdEditor === 'vMdEditor'" 
                    :text="msg"
                    class="viewer"
                />
            </el-main>
            <el-footer>
                <el-button @click='doChat'>sendMsg</el-button>
                <el-button @click='doLogin'>doLogin</el-button>
                <el-button @click='connect'>Reconnect</el-button>
                <div>
                    <el-input @keydown.enter.native="handleEnterKeyDown" v-model='chatMsg' style='margin-top: 10px;' />
                    <el-tooltip effect="dark" placement="top" v-if="showTooltip">
                        <div class="hint-list-container">
                            <div v-for="(item, index) in hintList" :key="index"
                                :class="{ 'highlighted': index === highlightedIndex }" @click="fillInput(item)">
                                {{ item }}
                            </div>
                        </div>
                    </el-tooltip>
                </div>
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
import { helpMd, serverList, getSysTitle, cmdTips } from '@/api/helpMd'
import { getlogin, getNumberParam, getShowImgStr,getMask } from '@/api/regex'
import { isBlank, isNotBlank } from '@/util/str'
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
            imageList: [],
            mdEditor: 'bytemd',
            mdEditorList: ['bytemd','vMdEditor'],
            // 图片模糊程度
            blur: 0,
            // 屏蔽列表
            mask: {
                maskUserList: [],
                maskIpList: [],
                maskMacList: []
            }
        }
    },
    created() {
        this.showHelp()
    },
    watch: {
        chatMsg(newVal) {
            console.log(newVal.endsWith('\n'), 'inputMsg endsWith \\n');
            if (newVal.indexOf(' ') != -1) {
                this.showTooltip = false
                return
            }
            if (newVal.startsWith('#')) {
                this.showTooltip = true
                this.hintList = cmdTips(newVal)
                return
            }
            if (newVal.indexOf('@') != -1 ){
                this.showTooltip = true
                this.hintList = this.onlineUsers.filter(item => item.startsWith(newVal.substr(1)))
                return
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
            this.msg += helpMd()
        },
        chatSend() {
            let inputMsg = this.chatMsg
            this.chatMsg = ''
            if (inputMsg.startsWith('#')) {
                this.commandHandler(inputMsg)
            } else {
                this.sendMsg(chatJson(inputMsg))
            }
        },
        commandHandler(inputMsg) {
            // 登录操作
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
                const data = getShowImgStr(inputMsg, this.imageList)
                if (isNotBlank(data.errorMsg)) {
                    this.msg += addNewLine(data.errorMsg)
                    return
                }
                if (data.blur > 0 && this.mdEditor === 'bytemd') {
                    this.msg += addNewLine('当前markdown编辑器为bytemd，暂不支持图片模糊')
                    if (data.force) {
                        this.msg += addNewLine('用户配置强制切换md编辑器， 当前变更为v-md-editor')
                        this.mdEditor = this.mdEditorList[1]
                    }
                }
                for(let index of data.indexes) {
                    const imageUrl = this.imageList[index]
                    this.msg += addNewLine(`<img src="${imageUrl}" style="zoom:${data.zoom}%; filter: blur(${data.blur * 10}px)" /> `)
                }
                // let params = inputMsg.split(' ')
                // // 直接输入 showImage 展示最后一条图片消息
                // if (params.length == 1) {
                //     const imageUrl = this.imageList[this.imageList.length - 1]
                //     this.msg += addNewLine(`![${imageUrl}](${imageUrl})`)
                // }
                // if (params.length > 1) {
                //     params = params.splice(1)
                //     for (let item of params) {
                //         if (item == 'last') {
                //             const imageUrl = this.imageList[this.imageList.length - 1]
                //             this.msg += addNewLine(`![${imageUrl}](${imageUrl})`)
                //         } else if (isNaN(item)) {
                //             this.msg += addNewLine(`索引错误`)
                //         } else {
                //             let index = Number(item)
                //             if (index < 0) {
                //                 index = 0;
                //             }
                //             if (index >= this.imageList.length) {
                //                 index = this.imageList.length - 1
                //             }
                //             const imageUrl = this.imageList[this.imageList.length - 1]
                //             this.msg += addNewLine(`![${imageUrl}](${imageUrl})`)
                //         }
                //     }

                // }
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
                        cycle = Math.max(1, Number(numStr))
                    }
                }
                for (let i = 1; i <= cycle; i++) {
                    const data = generateSSQ()
                    let chatMsg = ''
                    chatMsg += addNewLine(`随机双色球结果: 红球：${data.redBalls} 蓝球 ${data.blueBall}`)
                    this.sendMsg(chatJson(chatMsg))
                }
                this.msg += addNewLine(``)
            }
            // 随机双色球
            if (inputMsg.startsWith('#showDLT')) {
                let params = inputMsg.split(' ')
                let cycle = 1;
                if (params.length == 1) {
                    cycle = 1;
                } else {
                    let numStr = params[1]
                    if (isNaN(numStr)) {
                        cycle = 1
                    } else {
                        cycle = Math.max(1, Number(numStr))
                    }
                }
                for (let i = 1; i <= cycle; i++) {
                    const data = generateDLT()
                    let chatMsg = ''
                    chatMsg += addNewLine(`随机大乐透结果: 红球：${data.redBalls} 蓝球 ${data.blueBalls}`)
                    this.sendMsg(chatJson(chatMsg))
                }
                this.msg += addNewLine(``)
            }
            // 切换md编辑器 
            if (inputMsg.startsWith('#changeEditor')) {
                const editorIndex = getNumberParam(inputMsg, 1)
                this.mdEditor = this.mdEditorList[editorIndex]
                this.msg += addNewLine(`当前markdown编辑器已切换 ::: ${this.mdEditor}`)
                return
            }
            // 屏蔽消息 
            if (inputMsg.startsWith('#mask')) {
                const data = getMask(inputMsg)
                if(isNotBlank(data.errorMsg)) {
                    this.msg += addNewLine(data.errorMsg)
                    return
                }
                this.mask.maskUserList.push(...data.maskUserList)
                this.mask.maskIpList.push(...data.maskIpList)
                this.mask.maskMacList.push(...data.maskMacList)
                this.msg += addNewLine(`当前屏蔽用户 ${this.mask.maskUserList}`)
                this.msg += addNewLine(`当前屏蔽IP ${this.mask.maskIpList}`)
                this.msg += addNewLine(`当前屏蔽MAC ${this.mask.maskMacList}`)
            }
            // 解除屏蔽
            if (inputMsg.startsWith('#unmask') ) {
                // 解除屏蔽
            }
        },
        
        // 展示系统消息
        showSysMsg() {
            this.msg += getSysTitle('系统消息')
        },
        // 获取时间字符串
        getDateStr() {
            const date = new Date()
            return date.toLocaleDateString()
        },
        // 连接websocket
        connect(username) {
            this.socket = new WebSocket(this.wsUrl);
            const that = this
            this.socket.onopen = function () {
                that.msg += addNewLine('**WebSocket Connect Success!**')
                that.doLogin(username)
            }
            this.socket.onmessage = function (event) {
                console.log(event);
                that.onWsMessage(event);
            }
            this.socket.onclose = function () {
                that.msg += addNewLine('**WebSocket Closed!**')
            }
        },
        // 登录操作
        doLogin(username) {
            let loginName = isBlank(username) ? this.username : username;
            if (this.checkStatus()) {
                this.heartBeat();
                this.sendMsg(loginJson(loginName));
            }
        },
        // 测试发消息用的
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
        // 检查 socket的状态
        checkStatus() {
            return !(this.socket == null || this.socket.readyState != 1)
        },
        // 接收到ws消息时使用
        onWsMessage(event) {
            const data = JSON.parse(event.data)
            if (data.type == 'HISTORY_MSG') {
                for (let item of data.body.msgList) {
                    this.singletonMsg(item)
                }
            } else {
                console.log(data)
                this.singletonMsg(data)
            }

        },
        isMask(user) {
          return this.mask.maskUserList.indexOf(user.username) != -1 ||
            this.mask.maskIpList.indexOf(user.ip) != -1 ||
            this.mask.maskMacList.indexOf(user.uuid) != -1  
        },
        // 处理单条消息
        singletonMsg(data) {
            if (data.type == 'SYSTEM') {
                this.msg += addNewLine(`**${data.time}【系统消息】${data.body}**`)
            }
            // 处理用户消息
            if (data.type == 'USER') {
                const body = data.body
                let content = body.content
                // eslint-disable-next-line no-debugger
                debugger
                if(this.isMask(data.user)) {
                    this.msg += addNewLine(`**** 用户消息已屏蔽 **** <font color=red>遥遥领先！</font>`)
                    return 
                }
                if (body.msgType == 'IMAGE') {
                    const imageUrl = `${this.imagePath}${content}`
                    this.imageList.push(imageUrl)
                    // 防止有人发黄土
                    // content = `![${content}](${this.imagePath}${content})`
                    content = `图片消息谨慎打开:: 当前索引 ::${this.imageList.indexOf(imageUrl)} :: ${imageUrl}`
                }
                this.msg += addNewLine(`${data.time}[${data.user.region.city}:${data.user.region.isp} ${data.user.username}]: ${content}`)
                if (body.toUsers != undefined && body.toUsers.length > 0) {
                    // todo
                    let atMe = body.toUsers.indexOf(this.username) != -1
                    if (atMe) {
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
            const data = { 'action': 'HEARTBEAT', 'body': {} }
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

.viewer {
    text-align: left;
}
.hint-list-container {
    max-height: 200px;
    overflow-y: auto;
    text-align: left;
}
.highlighted {
    background-color: yellow;
}
</style>
