document.addEventListener("DOMContentLoaded", function(event) {
    // 用户与页面交互后自动播放音乐
    function playBackgroundMusic() {
      const bgMusic = document.getElementById("bg-music");
      
      // 检查浏览器是否支持自动播放
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 音乐已经开始播放
          })
          .catch(error => {
            // 自动播放被浏览器阻止
            // 添加一个交互事件监听器，当用户点击页面时播放音乐
            document.addEventListener("click", function() {
              bgMusic.play();
              document.removeEventListener("click", this);
            });
          });
      }
    }
  
    // 在DOMContentLoaded事件中调用播放音乐函数
    playBackgroundMusic();
  });
  