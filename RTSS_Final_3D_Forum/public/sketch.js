let x = 0;
let y = 0;
let z = 0;
let myVideo;
let cam;
let players = {};
let liveMediaConnection; 
let DPI = 0.002; //mouse sensitivity
// var d;  //collision distance;
var dx;  // collision distance of x coordinate
var dz;  // collision distance of z coordinate
let moveSpeed = 1;
let secureDistance = 2*moveSpeed;
let env = 255;
var walls = [];
let comments = [];
var comment;
let fontSize = 0.05;
let canvas;

function submitComment() {
  comment = document.getElementById("comment").value;
  // if (liveMediaConnection) {
  //   let dataToSend = {
  //     othersComment: comment
  //   }
  //   liveMediaConnection.send(JSON.stringify(dataToSend));
  // }
  // comments.push(comment);
  console.log(comment);

  let nC = JSON.stringify(comment);
  serverConnection.send(nC);
}

function setup() {
  canvas = createCanvas(1300, 680, WEBGL);
  canvas.position(245, 215);

  var existedText = document.getElementsByClassName('comment');
  for (i = 0; i < existedText.length; i++) {
    comments.push(existedText[i].innerText);
  }

  // var existedText = document.getElementsByClassName('comment');
  // for (i = 0; i < existedText.length; i++) {
  //   var j = existedText.length - i;
  //   comments.push(existedText[j].innerText);
  // }

  textureWrap(REPEAT);
  cam = createCamera();

  var wallLength = comments.length
  
  for (var i = 0; i < wallLength; i ++ ) { 
    walls.push(new wallModule(0,0, 19* i));
  }
  
  liveMediaConnection = new p5LiveMedia(this, null, null, "avatar-room");
  liveMediaConnection.on("stream", gotStream);
  liveMediaConnection.on("disconnect", gotDisconnect);
  liveMediaConnection.on("data", gotData);
  myVideo = createCapture(VIDEO, gotLocalMediaStream);
  myVideo.muted = true;
  myVideo.hide();

  perspective(PI / 3.0, width / height, 0.1, 5000);
  cam.setPosition(0, 190, 0);
  cam.pan(PI)
}

function draw() {
  stroke(0);
  ambientLight(env);
  background(env-50);
  strokeWeight(0);
  push();
  rotateZ(PI);
  rotateY(PI);
  translate(0, -200, 0);
  loadScene();
  pop();
  // orbitControl();
  
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    cameraMotion();
  }
  
  for (let id in players) {
    let p = players[id];
    p.show();
    dx = abs(cam.eyeX - players[id].x);
    dz = abs(cam.eyeZ - players[id].z);
    // d = dist(cam.eyeX, cam.eyeZ, players[id].x, players[id].z);
    // console.log(d)
    // now see if distance between two is less than sum of two radius'
  }
  
  
  
  if (frameCount % 10 === 0){
    sharePosition();
  }
  
  push();
  translate(cam.eyeX, cam.eyeY+3, cam.eyeZ);
  box(2,2,2)
  pop();
}

// this function is called when our webcamera stream is ready
function gotLocalMediaStream(stream) {
  console.log("got local stream!");
  liveMediaConnection.addStream(stream, "CAPTURE");
}

// this function is called when a remote stream is ready
function gotStream(stream, id) {
  console.log("got remote stream!");
  
  players[id] = new Friend(stream, id);

  // hide the HTML <video> element
  stream.hide();
}

function sharePosition(){
  if (liveMediaConnection){
    let sendPos = {
      x: cam.eyeX,
      y: cam.eyeY,
      z: cam.eyeZ
    }
    let sendDir = {
      x: cam.centerX, 
      y: cam.centerY, 
      z: cam.centerZ
    }
    let dataToSend = {
      pos: sendPos,
      dir: sendDir
    }
    if (liveMediaConnection) {
      liveMediaConnection.send(JSON.stringify(dataToSend));
    }
  }
}

function gotData(data, id) {
  console.log("got incoming data from peer with ID", id);
  // console.log(data);
  let parsedData = JSON.parse(data);
  let pos = parsedData.pos;
  let dir = parsedData.dir;
  if (players[id]) {
    players[id].updatePos(pos.x, pos.y, pos.z);
    players[id].lookAt(dir.x,dir.y,dir.z);
    // console.log(data);
    // console.log(parsedData.othersComment);
    // comments.push(othersComment);
  }
}

function gotDisconnect(id) {
  delete players[id];
}

function mouseClicked() {
  console.log(cam.eyeX, cam.eyeY, cam.eyeZ);
}

// WEBSOCKET STUFF
const serverAddress = "wss://simple-websocket-server-echo.glitch.me/";

const serverConnection = new WebSocket(serverAddress);

serverConnection.onopen = function () {
  console.log("I just connected to the server on " + serverAddress);
};

serverConnection.onmessage = function (event) {
  event.preventDefault();
  comments.unshift(JSON.parse(event.data));
};