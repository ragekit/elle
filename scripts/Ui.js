function Ui(){
    
    this.container = document.querySelector(".options");
    
    this.angle = document.querySelector(".angle");
    this.angle.type = "range";
   // this.angle.style.position = "absolute";

    this.angle.min = -Math.PI;
    this.angle.max = Math.PI;
    this.angle.step = 0.001;
    this.angle.value = Math.PI /5;
    console.log(this.angle.value);

    this.length = document.querySelector(".length");
    this.length.type = "range";
   // this.length.style.position = "absolute";

    
    this.length.min = 0.0;
    this.length.max = 10;
    this.length.step = 0.001;
    
   
}

module.exports =  Ui;