let start;
let module;
let end;
let SourceSansPro;

function preload() {
  start = loadModel('3D_Assets/OBJ/start.obj');
  module = loadModel('3D_Assets/OBJ/module.obj');
  end = loadModel('3D_Assets/OBJ/end.obj');
  SourceSansPro = loadFont('Font/SourceSansPro-Regular.otf');
}

function loadScene() {
  push();
  normalMaterial();
  model(start);
  pop();
  
  push()
  for (let i = 0; i < comments.length; i++) {
    if (i == 0) {
      push();
      normalMaterial();
      model(module);
      pop();
    } else {
      translate(0, 0, 19);
      push();
      normalMaterial();
      model(module);
      pop();
    }
  }
  pop()
  

  translate(0, 0, 19*(comments.length-1));
  normalMaterial();
  model(end);

  
  for (var i = 0; i < walls.length; i ++ ) { 
    walls[i].display();
  }
  
  push();
  rotateX(PI);
  translate(-10, 0, 0);
  for (let i = comments.length-1; i >= 0; i--) {
    translate(0, 0, 19);
    
    push();
    rotateY(PI/2);
    translate(19, -13, -19);
    scale(fontSize);
    textFont(SourceSansPro);
    text(comments[i], 0, 0);
    pop();
  }
  pop();
}