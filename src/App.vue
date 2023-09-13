<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <toolTips />
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <webView />
    
  </div>
</template>

<script>
import webView from './components/webView.vue';
import toolTips from './components/toolTips.vue';

export default {
  name: 'App',
  components: {
    webView,
    toolTips
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
