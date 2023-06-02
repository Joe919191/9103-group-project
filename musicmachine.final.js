document.addEventListener("DOMContentLoaded", function(event) {
  // Get fish quantity input and music
  const numFishesInput = document.getElementById("num-fishes-input");
  const bgMusic = document.getElementById("bg-music");
  const obstacleMusic = document.getElementById("obstacle-music");
  let hasInteracted = false; // determine whether user has interacted
  let isBgMusicPlaying = false; // determine if background music is playing

  // add event listener to fish quantity input
  numFishesInput.addEventListener("input", function() {
    const quantity = parseInt(numFishesInput.value);

    if (!hasInteracted) {
      // play bg-music
      if (quantity > 0 && !isBgMusicPlaying) {
        bgMusic.currentTime = 0; // start playing from the begining of the bg-music
        bgMusic.play();
        isBgMusicPlaying = true;
      } else if (quantity === 0 && isBgMusicPlaying) {
        bgMusic.pause();
        isBgMusicPlaying = false;
      }
      hasInteracted = true; // set interacted to true
    } else {
      // music stops if Fish Quantity returns to zero
      if (quantity === 0 && isBgMusicPlaying) {
        bgMusic.pause();
        isBgMusicPlaying = false;
      } else if (quantity > 0 && !isBgMusicPlaying) {
        bgMusic.currentTime = 0; // start playing from the begining of the bg-music
        bgMusic.play();
        isBgMusicPlaying = true;
      }
    }
  });

  // add event listener to svgContainer
  document.addEventListener("click", function(event) {
    // check if the click is acted on the svgContainer
    const target = event.target;
    const svgContainer = document.getElementById("sketch-container");
    if (svgContainer.contains(target)) {
      // play obstacle-music
      obstacleMusic.currentTime = 0; // start playing from the begining of the obstacle-music
      obstacleMusic.play();
      return;
    }

    // check if the Remove all obstacle button is clicked
    const removeObstacleButton = document.getElementById("remove-obstcle-button");
    if (target === removeObstacleButton) {
      return; // if the button is clicked, the following code will not run
    }

    // check if the input bar has been dragged to input fish quantity 
    if (target === numFishesInput) {
      return; // if the fish quantity has been inputted, the following code will not run
    }

    // music stops if Fish Quantity returns to zero
    const quantity = parseInt(numFishesInput.value);
    if (quantity === 0 && isBgMusicPlaying) {
      bgMusic.pause();
      isBgMusicPlaying = false;
    }
  });
});
