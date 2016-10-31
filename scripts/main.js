var L = require("./L");
var Drawer = require("./Drawer");
var Ui = require("./Ui");


String.prototype.setCharAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
}


var elle = new L();
var div;
var numberofDrawers = 9;
var drawerList = [];
var u = new Ui();

var maxIteration = 5;

function init(){
    elle.addVariables("XF");
    elle.addconstants("+-[]");
    elle.axiom = "X";
    elle.addRule("X","F-[[X]+X]+F[+FX]-X");
    elle.addRule("F","FF");
    elle.generate(maxIteration);
    
    div = document.querySelector(".canvases");
    div.style.width = window.innerWidth + "px";
    div.style.height = window.innerHeight + "px";
    
    for (var i = 0; i < numberofDrawers; i++) {
        var canvas = document.createElement("canvas");
        div.appendChild(canvas);
        canvas.width = window.innerWidth/Math.sqrt(numberofDrawers);
        canvas.height = window.innerHeight/Math.sqrt(numberofDrawers);
        var ctx = canvas.getContext("2d");
        var drawer = new Drawer(elle,ctx,{x:canvas.width/2,y:canvas.height/2},Math.PI/5,0);
        drawerList.push(drawer);
    }
    
    
    mutateFromModel(elle);
}

function resize(){
    div.style.width = window.innerWidth + "px";
    div.style.height = window.innerHeight + "px";
    
     for (var i = 0; i < drawerList.length; i++) {
     
         drawerList[i].ctx.canvas.width = window.innerWidth/3;
         drawerList[i].ctx.canvas.height = window.innerHeight/3;
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
        drawerList[i].angle = parseFloat(u.angle.value);
        drawerList[i].lineLength = parseFloat(u.length.value);
        
        drawerList[i].draw();
        
    }
    requestAnimationFrame(loop);
})(0);




window.onresize = resize;
window.onload = init;
