const FISH_SIZE = 20;
const MAX_SPEED = 5;
const MAX_FORCE = 0.05;
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
  clear(); // 清除画布
  background('rgba(0,0,0,0)');
  fishSimulation.run();
}

function windowResized() {
  waterWidth = windowWidth;
  waterHeight = windowHeight*0.5;
  resizeCanvas(waterWidth, waterHeight);

}

class FishSimulation {
  constructor() {
    this.fishes = [];
    this.obstacles = [];
  }

  createFish(numFishes) {
    for (let i = 0; i < numFishes; i++) {
      let position, velocity, fish;
      let isOverlapping = true;
      while (isOverlapping) {
        position = createVector(random(waterWidth), random(waterHeight));
        velocity = createVector(random(-1, 1), random(-1, 1));
        fish = new Fish(position, velocity);
      
        // 检查鱼与现有鱼的位置是否重叠
        isOverlapping = this.fishes.some(existingFish => {
          const distance = p5.Vector.dist(existingFish.position, fish.position);
          return distance < FISH_SIZE * 2; // 调整这个值以控制鱼的最小间距
        });
      }   
      this.fishes.push(fish);
    }
  }

  removeFishes() {
    this.fishes = [];
  }
  
  createObstacle(x, y) {
    const obstacleSize = random(40, 80); // 随机生成障碍物的大小
    const obstacle = new Obstacle(createVector(x, y), obstacleSize); // 将大小作为参数传递给 Obstacle 构造函数
    this.obstacles.push(obstacle);
  }

  removeObstacles() {
    this.obstacles = [];
  }

  run() {
    for (let i = 0; i < this.fishes.length; i++) {
      const fish = this.fishes[i];
      fish.update();
      fish.edges();
  
      for (let j = i + 1; j < this.fishes.length; j++) {
        const otherFish = this.fishes[j];
        const distance = p5.Vector.dist(fish.position, otherFish.position);
  
        if (distance < FISH_SIZE) {
          const direction = p5.Vector.sub(fish.position, otherFish.position).normalize();
          const separationForce = direction.mult(0.5);
          fish.applyForce(separationForce);
          otherFish.applyForce(separationForce.mult(-1));
        }
      }
    }
  
    this.fishes.forEach(fish => fish.display());
    this.obstacles.forEach(obstacle => obstacle.display());
  }

}


function setupEventListeners() {
  const waterCanvas = document.getElementById('sketch-water');
  const rangeInput = document.getElementById('num-fishes-input');
  const rangeValue = document.getElementById('range-value');

  rangeInput.value = rangeInput.min; 
  rangeValue.textContent = rangeInput.min;

  rangeInput.addEventListener('mouseup', function() {
      rangeValue.textContent = rangeInput.value;
      const numFishes = Number(rangeInput.value)
      fishSimulation.removeFishes(); // 清除现有的鱼
      if (numFishes> 0) {
        fishSimulation.createFish(numFishes); // 生成新的鱼
      }
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
    this.isGrouped = true; // 初始化为处于群聚状态
    this.groupColor = color(255, 192, 203); // 浅粉色
    this.randomColor = color(random(255), random(255), random(255)); // 随机颜色
    this.colorChangeFactor = 0.3; // 颜色变化的插值系数 
  }

  update() {
    this.flock(fishSimulation.fishes);
    this.avoidObstacles(fishSimulation.obstacles);
  
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  
    const buffer = FISH_SIZE * 2; // Buffer distance from the edge
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
  }
  
  avoidObstacles(obstacles) {
    obstacles.forEach(obstacle => {
      const desiredSeparation = obstacle.size*2 + FISH_SIZE;
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
 

  applyForce(force) {
    this.acceleration.add(force);
  }

  flock(fishes) {
    const separationDistance = FISH_SIZE * 2;
    const cohesionDistance = FISH_SIZE * 5;
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
  
    const separationForce = this.isGrouped ? createVector() : this.separate(fishes);
    const alignmentForce = this.align(fishes);
    const cohesionForce = this.cohesion(fishes);
    
    separationForce.mult(1.5);
    alignmentForce.mult(1.0);
    cohesionForce.mult(1.0);
    
    this.applyForce(separationForce);
    this.applyForce(alignmentForce);
    this.applyForce(cohesionForce);
    
    if (this.isGrouped) {
      this.color = lerpColor(this.color, this.groupColor, this.colorChangeFactor);
    } else {
      this.color = lerpColor(this.color, this.randomColor, this.colorChangeFactor * 5);
    }
  }

  separate(fishes) {
    const desiredSeparation = FISH_SIZE * 2;
    const sum = createVector();
    let count = 0;

    fishes.forEach(otherFish => {
      const distance = p5.Vector.dist(this.position, otherFish.position);
      if (distance > 0 && distance < desiredSeparation) {
        const difference = p5.Vector.sub(this.position, otherFish.position);
        difference.normalize();
        difference.div(distance);
        sum.add(difference);
        count++;
      }
    });

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      sum.sub(this.velocity);
      sum.limit(this.maxForce);
    }

    return sum;
  }

  align(fishes) {
    const desiredSeparation = FISH_SIZE * 5;
    const sum = createVector();
    let count = 0;

    fishes.forEach(otherFish => {
      const distance = p5.Vector.dist(this.position, otherFish.position);
      if (distance > 0 && distance < desiredSeparation) {
        sum.add(otherFish.velocity);
        count++;
      }
    });

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      sum.sub(this.velocity);
      sum.limit(this.maxForce);
    }

    return sum;
  }

  cohesion(fishes) {
    const desiredSeparation = FISH_SIZE * 2;
    const sum = createVector();
    let count = 0;

    fishes.forEach(otherFish => {
      const distance = p5.Vector.dist(this.position, otherFish.position);
      if (distance > 0 && distance < desiredSeparation) {
        sum.add(otherFish.position);
        count++;
      }
    });

    if (count > 0) {
      sum.div(count);
      const desired = p5.Vector.sub(sum, this.position);
      desired.normalize();
      desired.mult(this.maxSpeed);
      const steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    }

    return sum;
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
    const FISH_SIZE = 15; // 假设鱼的尺寸为45
  
    // 绘制鱼身体
    beginShape();
    vertex(FISH_SIZE * 1.2, 0); // 前端更宽的控制点
    bezierVertex(FISH_SIZE, -FISH_SIZE /0.6, -FISH_SIZE, -FISH_SIZE / 2, -FISH_SIZE, 0);
    bezierVertex(-FISH_SIZE, FISH_SIZE / 2, FISH_SIZE, FISH_SIZE / 0.6, FISH_SIZE * 1.2, 0); // 前端更宽的控制点
    endShape(CLOSE);
  
    // 绘制鱼尾巴
    beginShape();
    vertex(-FISH_SIZE, 0);
    vertex(-FISH_SIZE - FISH_SIZE / 2, -FISH_SIZE / 2);
    vertex(-FISH_SIZE - FISH_SIZE / 2, FISH_SIZE / 2);
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

    // 渐变填充颜色
    const gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, '#FFC0CB'); // 嫩粉色
    gradient.addColorStop(1, '#FF69B4'); // 深粉色
    drawingContext.fillStyle = gradient;

    // 绘制荷花花瓣
    const petalCount = 8; // 花瓣数量
    const angle = 360 / petalCount; // 每个花瓣之间的角度间隔

    for (let i = 0; i < petalCount; i++) {
      rotate(radians(angle * i));

      // 绘制叶子
      beginShape();
      curveVertex(-this.size / 4, 0);
      curveVertex(-this.size / 4, -this.size / 4);
      curveVertex(0, -this.size / 2);
      curveVertex(this.size / 4, -this.size / 4);
      curveVertex(this.size / 4, 0);
      endShape(CLOSE);

      // 复制对称叶子
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


