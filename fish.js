//Fetch the svg element and set its height and width. 
let width = window.innerWidth;
let height = window.innerHeight*0.66;

const svg = document.getElementById("water");
svg.setAttribute("width", width);
svg.setAttribute("height", height);
console.log(svg);

window.addEventListener("resize", resizeSvg);

function resizeSvg(){
    //to gather information about how they appear on the page.
    let bbox = svg.getBoundingClientRect();
    //console.log(bbox.height);

    svg.setAttribute("viewBox", `0 0 ${bbox.width} ${bbox.height}`);
}

class Fishes { 
  
  constructor(){

  }
  
  static drawFish() {

  let newFish = document.createElementNS("http://www.w3.org/2000/svg", "path");

  newFish.setAttribute("d", "M 90 90 A 3 3 90 0 0 90 113 C 102 113 114 94 119 95 C 120 99 120 104 119 108 C 114 109 102 90 90 90");
  newFish.setAttribute("fill", "blue");
  
  // Generate random coordinates for positioning
  let randomX = Math.round(Math.random() * width*0.95);
  let randomY = Math.round(Math.random() * height*0.7);
    
  // Set the transform attribute to position the path
  newFish.setAttribute("transform", "translate(" + randomX + "," + randomY + ")"); 

  svg.appendChild(newFish); 
  } 
}


//get the input box from the HTML
const numFishes = document.getElementById("num-fishes-input");

numFishes.addEventListener("input", function(e) {

  //First clear all the exisitng fishes.
  svg.replaceChildren();

  //Get the value of the numFishes input
  let numNewFishes = numFishes.value;
  console.log(numNewFishes);

  //Generate random positions for the number of fishes
  for(let i = 1; i<= numNewFishes; i++) {
    
    Fishes.drawFish();
  }

} );


// //we get removeFishesButton from the html page
// const removeFishesButton = document.getElementById("remove-fishes-button");

// removeFishesButton.addEventListener("click", function(e) {
//     //On click we clear all the exisitng squares
//     svg.replaceChildren();
// } );
