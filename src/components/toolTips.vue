<template>
    <div>
      <el-input v-model="inputValue" @keydown="handleKeydown"></el-input>
      <el-tooltip effect="dark" placement="top" v-if="showTooltip">
        <div class="hint-list-container">
          <div v-for="(item, index) in hintList" :key="index" :class="{ 'highlighted': index === highlightedIndex }" @click="fillInput(item)">
            {{ item }}
          </div>
        </div>
      </el-tooltip>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        inputValue: '',
        hintList: ['#login', '#exit'], // List of hints
        showTooltip: false,
        highlightedIndex: -1,
      };
    },
    watch: {
      inputValue(newVal) {
        this.showTooltip = newVal.startsWith('#') || newVal.indexOf('@') != -1
      }
    },
    methods: {
      handleKeydown(event) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.highlightedIndex = Math.max(0, this.highlightedIndex - 1);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.highlightedIndex = Math.min(this.hintList.length - 1, this.highlightedIndex + 1);
        } else if (event.key === 'Enter') {
          if (this.highlightedIndex !== -1) {
            this.fillInput(this.hintList[this.highlightedIndex].split(' ')[0]);
            this.doSend();
          }
        }
      },
      fillInput(item) {
        this.inputValue = item;
        this.showTooltip = false;
        this.highlightedIndex = -1;
      },
      doSend() {
        // Perform the desired action when Enter is pressed and a hint is selected
        // e.g., send the input value to a server or trigger a function
        console.log('Sending:', this.inputValue);
      },
    },
  };
</script>

<style>
.highlighted {
  background-color: yellow;
}
.hint-list-container {
  max-height: 200px;
  overflow-y: auto;
  text-align: float;
}
</style>