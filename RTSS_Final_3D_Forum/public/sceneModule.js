class wallModule {
  constructor(x, y, z) {
    this.x = x;  
    this.y = y;  
    this.z = z;  
    // this.model = model(module);
  }

  display() {
    push();
    normalMaterial();
    translate(this.x, this.y, this.z)
    model(module);
    pop();
  }
}