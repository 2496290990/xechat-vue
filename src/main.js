import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'highlight.js/styles/vs.css'
// import 'juejin-markdown-themes/dist/juejin.min.css'  // 掘金风格的css文件
import 'juejin-markdown-themes/dist/channing-cyan.min.css'  // channing-cyan风格的css文件，这个确实很好看
import 'bytemd/dist/index.css'  // 导入编辑器样式
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});


import { Viewer } from "@bytemd/vue"; // 导入编辑器组件

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Viewer)
Vue.use(VMdPreview);
new Vue({
  render: h => h(App),
}).$mount('#app')
