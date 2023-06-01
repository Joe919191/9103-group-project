document.addEventListener("DOMContentLoaded", function(event) {
  // 获取 Fish Quantity 输入框和音乐元素
  const numFishesInput = document.getElementById("num-fishes-input");
  const bgMusic = document.getElementById("bg-music");
  const obstacleMusic = document.getElementById("obstacle-music");
  let hasInteracted = false; // 判断用户是否已经进行了交互

  // 监听 Fish Quantity 输入框的 input 事件
  numFishesInput.addEventListener("input", function() {
    if (!hasInteracted) {
      // 开始播放 bg-music
      bgMusic.play();
      hasInteracted = true; // 将交互标志设置为 true
    }
  });

  // 添加点击页面事件监听器
  document.addEventListener("click", function(event) {
    // 检查点击事件是否发生在 SVG 容器内
    const target = event.target;
    const svgContainer = document.getElementById("sketch-container");
    if (svgContainer.contains(target)) {
      // 播放 obstacle-music
      obstacleMusic.currentTime = 0; // 从头开始播放 obstacle-music
      obstacleMusic.play();
      return;
    }

    // 检查点击事件是否发生在 Fish Quantity 输入框上
    if (target.id === "num-fishes-input") {
      return; // 如果是 Fish Quantity 输入框的点击事件，则不执行下面的代码
    }

    // 开始播放 bg-music（仅当用户尚未进行交互时）
    if (!hasInteracted) {
      bgMusic.play();
      hasInteracted = true; // 将交互标志设置为 true
    }
  });
});
