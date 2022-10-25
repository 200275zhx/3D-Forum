class Friend {
  constructor(stream, id){
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.heading = 0;
    this.stream = stream;
  }
  
  updatePos(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  //Reference: https://editor.p5js.org/shawn/sketches/JWqgLRAzu
  lookAt(x,y,z){
    let lookAtPos = createVector(x,z);
    let position = createVector(this.x,this.z);
    let LookAtDir = p5.Vector.sub(lookAtPos, position);
    this.heading = -LookAtDir.heading();
  }
  
  show(){
    push();
    translate(this.x, this.y, this.z);
    rotateY(this.heading + Math.PI/2);
    texture(this.stream);
    box(2);
    pop();
    
//     push();
//     translate(this.x, this.y, this.z - 5);
//     rotateY(this.heading + Math.PI/2);
//     fill('black');
//     box(110, 105, 100);
//     pop();
    
  push();
  translate(this.x, this.y+3, this.z);
  box(2,2,2)
  pop();
  }
}