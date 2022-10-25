function cameraMotion(){
  
  if (keyIsDown(87)) {
    z = -moveSpeed;
  }
  if (keyIsDown(83)) {
    z = moveSpeed;
  }
  if (keyIsDown(65)) {
    x = -moveSpeed;
  }
  if (keyIsDown(68)) {
    x = moveSpeed;
  }
  
  cam.eyeY = 190;
  
  //players collision
  
  for (let id in players) {
    if (dx <= 3 && cam.eyeZ < players[id].z + 2 && cam.eyeZ > players[id].z - (2+moveSpeed)) {
      if (cam.eyeX >= players[id].x) {
        cam.setPosition(players[id].x+3, cam.eyeY, cam.eyeZ);
      }
      if (cam.eyeX < players[id].x) {
        cam.setPosition(players[id].x-3, cam.eyeY, cam.eyeZ);
      }
    }
    if (dz <= 3 && cam.eyeX < players[id].x + 2 && cam.eyeX > players[id].x - (2-moveSpeed)) {
      if (cam.eyeZ >= players[id].z) {
        cam.setPosition(cam.eyeX, cam.eyeY, players[id].z+3);
      }
      if (cam.eyeZ < players[id].z) {
        cam.setPosition(cam.eyeX, cam.eyeY, players[id].z-3);
      }
    }
  }
  
  let endPos = -11 - 19*(comments.length);
  if (cam.eyeZ < 22 && cam.eyeZ > endPos-4) {
    if (cam.eyeX > (13+secureDistance)) {
      cam.setPosition(13+secureDistance, cam.eyeY, cam.eyeZ);
    }
    if (cam.eyeX < -(23.6+secureDistance)) {
      cam.setPosition(-(23.6+secureDistance), cam.eyeY, cam.eyeZ);
    }
  }
  
  if (cam.eyeX < 16 && cam.eyeX > -27) {
    if (cam.eyeZ > (18.7+secureDistance)) {
      cam.setPosition(cam.eyeX, cam.eyeY, 18.7+secureDistance);
    }
    if (cam.eyeZ < (endPos-secureDistance)) {
      cam.setPosition(cam.eyeX, cam.eyeY, endPos-secureDistance);
    }
  }
  
  cam.move(x, y, z);
  
}

function keyReleased() {
  x = 0;
  y = 0;
  z = 0;
  return false; // prevent any default behavior
}

function mouseMoved() {
  let horizontalPerspective = pmouseX - mouseX;
  let verticalPerspective = pmouseY - mouseY;
  if (cam && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
  cam.pan(horizontalPerspective * DPI);
  cam.tilt(-verticalPerspective * DPI);
  }
}