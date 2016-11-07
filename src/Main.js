var L = require("./L");
var Drawer = require("./Drawer");
//var Ui = require("./Ui");

String.prototype.setCharAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
}

var elle = new L();
var div;
var selected;

var plantInfos = document.querySelector(".plantInfos");
 div = document.querySelector(".canvases");
var canvases = div.querySelectorAll("canvas");
function init(){
    elle.addVariables("XF");
    elle.addconstants("+-[]");
    elle.axiom = "X";
    elle.addRule("X","F-[[X]+X]+F[+FX]-X");
    elle.addRule("F","FF");
   // elle.generate(5);

resize();
    for (var i = 0; i < canvases.length; i++) {
        var c = canvases[i]

        var ctx = c.getContext("2d");
        var drawer = new Drawer(elle,ctx,{x:c.width/2,y:c.height/2},Math.PI/5,0);
        ctx.canvas.addEventListener("mousedown",onDrawerMouseClick.bind(drawer))
    }
       

    Drawer.mutateFromModel(elle);
}

function resize(){

    var containerBB = div.getBoundingClientRect();

     for (var i = 0; i <canvases.length; i++) {
        var c = canvases[i];
        var flooredSqrt = Math.sqrt(canvases.length);

        var defaultWidth = Math.floor(containerBB.width/flooredSqrt);
        var defaultHeight = Math.floor(containerBB.height/flooredSqrt);

         
         c.width = defaultWidth;
         console.log(defaultHeight);
         c.height = defaultHeight;
         c.style.left = (defaultWidth * (i%flooredSqrt)) + "px";
         c.style.top = (defaultHeight * Math.floor(i/flooredSqrt)) + "px";
     }
}



(function loop(time){
    var shittodrawlength = 0;
    for (var i = 0; i < Drawer.list.length; i++) {
        //update UI
   //     drawerList[i].angle = parseFloat(u.angle);
//        drawerList[i].lineLength = parseFloat(u.length);

        Drawer.list[i].draw();
    }
    requestAnimationFrame(loop);
})(0);


function onDrawerMouseClick(){
    
    //this is the drawer clicked;
    
    for (var i = 0; i < Drawer.list.length; i++) {
        Drawer.list[i].ctx.canvas.classList.remove("selected");
       // console.log(drawerList[i].l.rules);
        Drawer.list[i].ui.unbindListener();
    }
    this.ctx.canvas.classList.add("selected");
    this.ui.bindListener();
    selected = this;
    
    
     plantInfos.innerHTML = "";
    //move to lsystem method;
    for(var i in this.l.rules){
        plantInfos.innerHTML += i + "<br/>";
        plantInfos.innerHTML += this.l.rules[i] +"<br/>";

    }

}

//Ui.DomMutate.addEventListener("click",mutateFromModel(selected.l));

window.onresize = resize;
window.onload = init;
