function Ui(){
    
    this.container = document.querySelector(".options");
    
    this.angle = document.createElement("input");
    this.angle.type = "range";
   // this.angle.style.position = "absolute";

    this.angle.min = -Math.PI;
    this.angle.max = Math.PI;
    this.angle.step = 0.001;
    this.angle.value = Math.PI /5;
    console.log(this.angle.value);

    
    this.length = document.createElement("input");
    this.length.type = "range";
   // this.length.style.position = "absolute";

    
    this.length.min = 0.0;
    this.length.max = 10;
    this.length.step = 0.001;
    
    this.container.appendChild(this.angle);
    this.container.appendChild(this.length);
    
    
}

module.exports =  Ui;