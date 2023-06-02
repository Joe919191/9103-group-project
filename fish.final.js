const NEIGHBOR_DIST = 15;
const MAX_SPEED = 1;
const MAX_FORCE = 0.01;
let fishSimulation;

let waterWidth = 0;
let waterHeight = 0;

function setup() {
  const sketchContainer = document.getElementById('sketch-container');

  waterWidth = windowWidth;
  waterHeight = windowHeight*0.5;
  const waterCanvas = createCanvas(waterWidth, waterHeight);
  waterCanvas.id('sketch-water');
  waterCanvas.parent(sketchContainer);
  waterWidth = width;

  fishSimulation = new FishSimulation();
  setupEventListeners();
}

function draw() {
  clear(); // clear canvas
  background('rgba(0,0,0,0)');
  fishSimulation.run();
}

function windowResized() {
  waterWidth = windowWidth;
  waterHeight = windowHeight*0.5;
  resizeCanvas(waterWidth, waterHeight);
  fishSimulation.removeObstacles();
}

class FishSimulation {
  constructor() {
    this.fishes = [];
    this.obstacles = [];
    this.obstacleNumber = 0;
  }

  createFish(numFishes) {
    for (let i = 0; i < numFishes; i++) {
      let position, velocity, fish;
      let isOverlapping = true;
      while (isOverlapping) {
        position = createVector(random(waterWidth), random(waterHeight));
        velocity = createVector(random(-1, 1), random(-1, 1));
        fish = new Fish(position, velocity);
      
        // check if new fish is overlapped with existing fish
        isOverlapping = this.fishes.some(existingFish => {
          const distance = p5.Vector.dist(existingFish.position, fish.position);
          return distance < NEIGHBOR_DIST*3; // adjust this value to control minimun distance between fishes
        });
      }   
      this.fishes.push(fish);
    }
  }

  removeFishes() {
    this.fishes = [];
  }
  
  createObstacle(x, y) {
    const obstacleSize = random(40, 80);
    const obstacle = new Obstacle(createVector(x, y), obstacleSize);
    this.obstacles.push(obstacle);
  
    this.obstacleNumber = this.obstacles.length;
    const obstacleNumberSpan = document.getElementById('obstacle-number');
    obstacleNumberSpan.textContent = this.obstacleNumber;
  }

  removeObstacles() {
    this.obstacles = [];
    this.obstacleNumber = 0;
    const obstacleNumberSpan = document.getElementById('obstacle-number');
    obstacleNumberSpan.textContent = this.obstacleNumber;
  }

  run() {
    this.obstacles.forEach(obstacle => obstacle.display());
    this.fishes.forEach(fish => fish.run(this.fishes, this.obstacles));
  }

}


function setupEventListeners() {
  const waterCanvas = document.getElementById('sketch-water');
  const rangeInput = document.getElementById('num-fishes-input');
  const rangeValue = document.getElementById('range-value');
  const removeObstaclesBtn = document.getElementById('remove-obstcle-button');

  rangeInput.value = rangeInput.min; 
  rangeValue.textContent = rangeInput.min;

  rangeInput.addEventListener('mouseup', function() {
    rangeValue.textContent = rangeInput.value;
    const numFishes = Number(rangeInput.value)
    fishSimulation.removeFishes(); // clear all existing fish
    if (numFishes> 0) {
      fishSimulation.createFish(numFishes); // generate new fishes
    }
  });

  removeObstaclesBtn.addEventListener('click', function() {
    fishSimulation.removeObstacles(); // add event listener to remove obstacles
  });

  rangeInput.addEventListener('input', function() {
    const value = rangeInput.value;
    rangeValue.textContent = value;
  });

  waterCanvas.addEventListener('click', function(event) {
    const { offsetX, offsetY } = event;
    fishSimulation.createObstacle(offsetX, offsetY);
  });

}

class Fish {
  constructor(position, velocity) {
    this.position = position.copy();
    this.velocity = velocity.copy();
    this.acceleration = createVector();
    this.maxSpeed = MAX_SPEED;
    this.maxForce = MAX_FORCE;
    this.color = color(random(255), random(255), random(255));
    this.isGrouped = true; // initialised state as grouped 
    this.groupColor = color(255, 192, 203); // light pink
    this.randomColor = color(random(255), random(255), random(255)); // random colour
  }

  run(fishes, obstacles){
    this.flock(fishes);
    this.avoid(obstacles);
    this.update();
    this.edges();
    this.display();
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  flock(fishes) {
    const separationDistance = NEIGHBOR_DIST * 0.01;
    const cohesionDistance = NEIGHBOR_DIST * 5;
    const center = createVector();
    let isGrouped = false;
  
    fishes.forEach(other => {
      center.add(other.position);
      const distance = p5.Vector.dist(this.position, other.position);
      if (distance < cohesionDistance && distance > separationDistance) {
        isGrouped = true;
      }
    });  
    center.div(fishes.length);
    if (isGrouped) {
      const distance = p5.Vector.dist(this.position, center);
      if (!this.isGrouped && distance < cohesionDistance) {
        this.isGrouped = true;
      }
    } else {
      this.isGrouped = false;
    }
  
    const separationForce = this.separate(fishes);
    const alignmentForce = this.align(fishes);
    const cohesionForce = this.cohesion(fishes);
    
    separationForce.mult(1.5);
    alignmentForce.mult(1.0);
    cohesionForce.mult(1.0);
    
    this.applyForce(separationForce);
    this.applyForce(alignmentForce);
    this.applyForce(cohesionForce);

  }

  avoid(obstacles) {
    obstacles.forEach(obstacle => {
      const desiredSeparation = obstacle.size*3 + NEIGHBOR_DIST;
      const distance = p5.Vector.dist(this.position, obstacle.position);
  
      if (distance < desiredSeparation) {
        const desired = p5.Vector.sub(this.position, obstacle.position);
        desired.normalize();
        desired.mult(this.maxSpeed);
        const steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        this.applyForce(steer);
      }
    });
  }

  update() { 
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
    // Buffer distance from the edge
    const buffer = NEIGHBOR_DIST * 2; 
    if (
      this.position.x < buffer ||
      this.position.x > waterWidth - buffer ||
      this.position.y < buffer ||
      this.position.y > waterHeight - buffer
    ) {
      // Reflect the fish's velocity
      const angle = this.velocity.heading();
      const reflection = createVector(cos(angle + PI), sin(angle + PI));
      this.velocity.reflect(reflection);
      // Adjust fish position to prevent sticking to the boundary
      this.position.x = constrain(this.position.x, buffer, waterWidth - buffer);
      this.position.y = constrain(this.position.y, buffer, waterHeight - buffer);
    }

    if (this.isGrouped) {
      this.color = this.groupColor;
    } else {
      this.color = this.randomColor;
    }
    
  } 

  // Separation
  // Method checks for nearby fishes and steers away
  separate(fishes) {
    const neighborDist = NEIGHBOR_DIST;
    const steer = createVector();
    let count = 0;
    // For every fish in the system, check if it's too close
    fishes.forEach(otherFish => {
      const distance = p5.Vector.dist(this.position, otherFish.position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (distance > 0 && distance < neighborDist) {
        // Calculate vector pointing away from neighbor
        const difference = p5.Vector.sub(this.position, otherFish.position);
        difference.normalize();
        difference.div(distance); // Weight by distance
        steer.add(difference);
        count++;  // Keep track of how many
      }
    });
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }  
    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  align(fishes) {
    const neighborDist = NEIGHBOR_DIST*8;
    const sum = createVector(0,0);
    let count = 0;
    fishes.forEach(otherFish => {
      const distance = p5.Vector.dist(this.position, otherFish.position);
      if (distance > 0 && distance < neighborDist) {
        sum.add(otherFish.velocity);
        count++;
      }
    });
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  // Cohesion
  // For the average location (i.e. center) of all nearby fishes, calculate steering vector towards that location
  cohesion(fishes) {
    const neighborDist = NEIGHBOR_DIST*5;
    const sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    fishes.forEach(otherFish => {
      const distance = p5.Vector.dist(this.position, otherFish.position);
      if (distance > 0 && distance < neighborDist) {
        sum.add(otherFish.position);  // Add location
        count++;
      }
    });
    if (count > 0) {
      sum.div(count)
      let desired = p5.Vector.sub(sum, this.position);  // A vector pointing from the location to the target 
      desired.normalize();  // Normalize desired and scale to maximum speed
      desired.mult(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.velocity); // Steering = Desired minus Velocity
      steer.limit(this.maxForce);  // Limit to maximum steering force
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  edges() {
    if (this.position.x > waterWidth) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = waterWidth;
    }

    if (this.position.y > waterHeight) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = waterHeight;
    }
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    fill(this.color);
    noStroke();
    let shapeSize = 8;
  
    // draw fish body
    beginShape();
    vertex(shapeSize * 1.2, 0); // control fish head
    bezierVertex(shapeSize, -shapeSize /0.6, -shapeSize, -shapeSize / 2, -shapeSize, 0);
    bezierVertex(-shapeSize, shapeSize / 2, shapeSize, shapeSize / 0.6, shapeSize * 1.2, 0); // control fish head
    endShape(CLOSE);
  
    // fish tail
    beginShape();
    vertex(-shapeSize, 0);
    vertex(-shapeSize - shapeSize / 2, -shapeSize / 2);
    vertex(-shapeSize - shapeSize / 2, shapeSize / 2);
    endShape(CLOSE);
  
    pop();
  }


}


class Obstacle {
  constructor(position, size) {
    this.position = position.copy();
    this.size = size;
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    noStroke();

    // gardient fill
    const gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, '#FFC0CB'); // light pink
    gradient.addColorStop(1, '#FF69B4'); // dark pink
    drawingContext.fillStyle = gradient;

    // draw flowers
    const petalCount = 8; // petal quantity
    const angle = 360 / petalCount; // angle between each petal

    for (let i = 0; i < petalCount; i++) {
      rotate(radians(angle * i));

      // draw petals
      beginShape();
      curveVertex(-this.size / 4, 0);
      curveVertex(-this.size / 4, -this.size / 4);
      curveVertex(0, -this.size / 2);
      curveVertex(this.size / 4, -this.size / 4);
      curveVertex(this.size / 4, 0);
      endShape(CLOSE);

      // duplicate symmetrical petals
      push();
      scale(-1, 1);
      beginShape();
      curveVertex(-this.size / 4, 0);
      curveVertex(-this.size / 4, -this.size / 4);
      curveVertex(0, -this.size / 2);
      curveVertex(this.size / 4, -this.size / 4);
      curveVertex(this.size / 4, 0);
      endShape(CLOSE);
      pop();
    }

    pop();
  }
}


