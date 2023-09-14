// 生成双色球结果
export function generateSSQ() {
    const redBalls = Array.from({ length: 6 }, () => Math.floor(Math.random() * 33) + 1);
    const blueBall = Math.floor(Math.random() * 16) + 1;
    redBalls.sort((a,b) => a -b)
    return {
      redBalls,
      blueBall
    };
  }
  
  // 生成大乐透结果
  export function generateDLT() {
    const redBalls = Array.from({ length: 5 }, () => Math.floor(Math.random() * 35) + 1);
    const blueBalls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 12) + 1);
    redBalls.sort((a, b) => a - b);
    blueBalls.sort((a, b) => a - b);
    return {
      redBalls,
      blueBalls
    };
  }
  
  // 示例用法
  const ssqResult = generateSSQ();
  const dltResult = generateDLT();
  
  console.log("双色球结果:", ssqResult);
  console.log("大乐透结果:", dltResult);