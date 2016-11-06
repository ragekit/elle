var L = require("./L");
var Drawer = require("./Drawer");
//var Ui = require("./Ui");


String.prototype.setCharAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
}


var elle = new L();
var div;
var drawerList = [];

var maxIteration = 5;

var plantInfos = document.querySelector(".plantInfos");

function init(){
    elle.addVariables("XF");
    elle.addconstants("+-[]");
    elle.axiom = "X";
    elle.addRule("X","F-[[X]+X]+F[+FX]-X");
    elle.addRule("F","FF");
    elle.generate(maxIteration);
    
    div = document.querySelector(".canvases");
   
    var canvases = div.querySelectorAll("canvas"); 
    
    for (var i = 0; i < canvases.length; i++) {
        var c = canvases[i]
        
        var ctx = c.getContext("2d");
        var drawer = new Drawer(elle,ctx,{x:c.width/2,y:c.height/2},Math.PI/5,0);
        drawerList.push(drawer);
        ctx.canvas.addEventListener("mousedown",onDrawerMouseClick.bind(drawer))     
    }
    resize();
    mutateFromModel(elle);
}

function resize(){
    
    var containerBB = div.getBoundingClientRect();
  
    
     for (var i = 0; i < drawerList.length; i++) {
        var c = drawerList[i].ctx.canvas;
        var flooredSqrt = Math.sqrt(drawerList.length);
         
        var defaultWidth = Math.floor(containerBB.width/flooredSqrt);
        var defaultHeight = Math.floor(containerBB.height/flooredSqrt);
        
         c.width = defaultWidth;
         c.height = defaultHeight;
         c.style.left = (defaultWidth * (i%flooredSqrt)) + "px";
         c.style.top = (defaultHeight * Math.floor(i/flooredSqrt)) + "px";
     }
}

function mutateFromModel(baseSystem)
{
    
    for (var i = 0; i < drawerList.length; i++) {
        var clone = baseSystem.clone();
        clone.mutate();
        clone.generate(maxIteration);
        

        drawerList[i].l = clone;


        drawerList[i].reset();
        drawerList[i].ctx.canvas.width = drawerList[i].ctx.canvas.width;
    }
}

(function loop(time){
    var shittodrawlength = 0;
    for (var i = 0; i < drawerList.length; i++) {
        //update UI
   //     drawerList[i].angle = parseFloat(u.angle);
//        drawerList[i].lineLength = parseFloat(u.length);
        
        drawerList[i].draw();
    }
    requestAnimationFrame(loop);
})(0);


function onDrawerMouseClick(){
    for (var i = 0; i < drawerList.length; i++) {
        drawerList[i].ctx.canvas.classList.remove("selected");
       // console.log(drawerList[i].l.rules);
        
    }
    this.ctx.canvas.classList.add("selected");
   // console.log(this.l.rules);
    
  //  this.ctx.canvas.width -= 50; 
//     this.ctx.canvas.height -= 50; 
     plantInfos.innerHTML = "";
    //move to lsystem method;
    for(var i in this.l.rules){
        plantInfos.innerHTML += i + "<br/>";
        plantInfos.innerHTML += this.l.rules[i] +"<br/>";
        
    }
   
}



window.onresize = resize;
window.onload = init;
