var L = require("./L");
var Drawer = require("./Drawer");

function App(){
    this.elle = new L();
    this.CanvasContainer;
    this.selected;
    this.plantInfos = document.querySelector(".plantInfos");
    this.CanvasContainer = document.querySelector(".canvases");
    this.canvases = this.CanvasContainer.querySelectorAll("canvas");   
}

App.prototype.init = function(){
        
    this.elle.addVariables("XF");
    this.elle.addconstants("+-[]");
    this.elle.axiom = "X";
    this.elle.addRule("X","F-[[X]+X]+F[+FX]-X");
    this.elle.addRule("F","FF");
   // elle.generate(5);

    this.resize();
    for (var i = 0; i < this.canvases.length; i++) {
        var c = this.canvases[i]

        var ctx = c.getContext("2d");
        var drawer = new Drawer(this.elle,ctx,{x:c.width/2,y:c.height/2},Math.PI/5,0);
        //ctx.canvas.addEventListener("mousedown",onDrawerMouseClick.bind(drawer))    
    }
    Drawer.mutateFromModel(this.elle);
    this.update();
}

App.prototype.resize = function(){
    var containerBB = this.CanvasContainer.getBoundingClientRect();

     for (var i = 0; i <this.canvases.length; i++) {
        var c = this.canvases[i];
        var flooredSqrt = Math.sqrt(this.canvases.length);

        var defaultWidth = Math.floor(containerBB.width/flooredSqrt);
        var defaultHeight = Math.floor(containerBB.height/flooredSqrt);

         
         c.width = defaultWidth;
         console.log(defaultHeight);
         c.height = defaultHeight;
         c.style.left = (defaultWidth * (i%flooredSqrt)) + "px";
         c.style.top = (defaultHeight * Math.floor(i/flooredSqrt)) + "px";
     }

}

App.prototype.update = function(){
     for (var i = 0; i < Drawer.list.length; i++) {
        Drawer.list[i].draw();
    }
    requestAnimationFrame(this.update.bind(this));
}

module.exports = App;