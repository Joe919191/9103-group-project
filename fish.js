//Fetch the svg element and set its height and width. 
let width = window.innerWidth;
let height = window.innerHeight/2;

const svg = document.getElementById("water");
svg.setAttribute("width", width);
svg.setAttribute("height", height);
//svg.setAttribute("background-color", "url(#Gradient)");
console.log(svg);

function drawWater() {

  let waterColour = document.createElementNS("http://www.w3.org/2000/svg", "rect");

  waterColour.setAttribute("x", 0);
  waterColour.setAttribute("y", 0);
  waterColour.setAttribute("width", width);
  waterColour.setAttribute("height", height);
  waterColour.setAttribute("fill", "url(#Gradient)");

  svg.appendChild(waterColour);
}
drawWater();

//randomNum(lower, upper)


function drawFish(x,y) {
  //let X = Math.round(Math.random() * width);
  //let Y = Math.round(Math.random() * height);

  let newFish = document.createElementNS("http://www.w3.org/2000/svg", "path");

  newFish.setAttribute("d", "M30,100 Q50,50 100,70 Q150,50 170,100 Q150,150 100,130 Q50,150 30,100 Z M170,100 L200,85 L200,115 Z");
  newFish.setAttribute("fill", "blue");

  svg.appendChild(newFish);
}


//get the input box from the HTML
const numFishes = document.getElementById("num-fishes-input");

//We get our generateFishesButton from the HTML
const generateFishesButton = document.getElementById("generate-fishes-button");

generateFishesButton.addEventListener("click", function(e) {

  //First clear all the exisitng fishes.
  svg.replaceChildren();

  //Get the value of the numFishes input
  let numNewFishes = numFishes.value;
  console.log(numNewFishes);

  //Generate random positions for the number of fishes
  for(let i = 1; i<= numNewFishes; i++) {
    drawFish();
  }

} );


//we get removeFishesButton from the html page
const removeFishesButton = document.getElementById("remove-fishes-button");

removeFishesButton.addEventListener("click", function(e) {
    //On click we clear all the exisitng squares
    svg.replaceChildren();
} );

