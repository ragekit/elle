(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Drawer(lSystem,context,startpos,angle,jitter = 0){
    this.l = lSystem;
    this.cameraPos = {x:0,y:0};
    
    this.startArgument = {pos :{x:startpos.x,y:startpos.y}, dir : -Math.PI /2};
    
    this.position = {x:startpos.x,y:startpos.y}
    this.direction = -Math.PI /2;
    this.savedPosition = [];
    this.angle = angle;
    this.ctx = context;
    this.jitter = jitter;
    this.done = false;
    
    this.buffer = [];
    this.lineLength = 2;
    this.currentDrawIndex = 0;
    
    //drag move parameters
    this.mouseDown = false;
    this.clickPosition;
    
    this.ctx.canvas.addEventListener("mousedown",this.onClick.bind(this));
    window.addEventListener("mousemove",this.onMouseMove.bind(this));
    window.addEventListener("mouseup",this.onMouseUp.bind(this));
    
    this.drawingFunctions = {
        "F" : () => {
            this.buffer.push({x:this.cameraPos.x + this.position.x,y:this.cameraPos.y + this.position.y});
            this.position.x = this.position.x + Math.cos(this.direction) *this.lineLength;
            this.position.y = this.position.y + Math.sin(this.direction) *this.lineLength;
            this.buffer.push({x:this.cameraPos.x + this.position.x,y:this.cameraPos.y + this.position.y});
        },
        "+" : () => {
            this.direction += this.angle + (Math.random()*2 -1)*this.jitter;

        },
        "-" : () => {
            this.direction -= this.angle + (Math.random()*2 -1)*this.jitter;
            },
        "[" : () => {
            this.savedPosition.push({pos:{x:this.position.x,y:this.position.y},dir:this.direction});
                
        },
        "]" : () => {
            
            if(this.savedPosition.length == 0){
             // console.log("non pop");
              return
              
            } 
            
            var saved = this.savedPosition.pop();
        
            
                
                this.position = saved.pos;
                this.direction = saved.dir;
                
            
        },
    }
}
Drawer.prototype.reset = function(){
    this.done = false;
    this.currentDrawIndex = 0;
    this.buffer = [];
    this.savedPosition = [];
    this.direction = this.startArgument.dir;
    this.position.x = this.startArgument.pos.x;
    this.position.y = this.startArgument.pos.y;
    
}


Drawer.prototype.onClick = function(e){
    this.clickPosition = {x:e.clientX,y:e.clientY};
    this.mouseDown = true;    
}
Drawer.prototype.onMouseMove = function(e){
    if(this.mouseDown)
    {
        this.cameraPos.x += e.clientX - this.clickPosition.x;
        this.cameraPos.y += e.clientY - this.clickPosition.y;
        this.clickPosition = {x:e.clientX,y:e.clientY};
    }
}

Drawer.prototype.onMouseUp = function(e){
    this.mouseDown = false;
}

Drawer.prototype.fillBuffer = function(){
       this.reset();

    if(this.l.output.length == 0) return;
    var nbOfDrawActions = 0;
    
    for (var i = 0; i < this.l.output.length; i++) {
        
        if(this.drawingFunctions[this.l.output[i]] == undefined) continue;
        
        
        
        this.drawingFunctions[this.l.output[i]].call(this);
        nbOfDrawActions ++;
        
    }
    
    
}

Drawer.prototype.draw = function(nb){
    this.fillBuffer();
    
    this.ctx.canvas.width =this.ctx.canvas.width;
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(0,0,0,1)";
    
    

        for (var j = 0; j < this.buffer.length; j+=2) {
           var pos = this.buffer[j];
           this.ctx.moveTo(pos.x,pos.y);
           pos = this.buffer[j+1];
           this.ctx.lineTo(pos.x,pos.y);
        }
           
    this.ctx.stroke();
}


module.exports = Drawer;
},{}],2:[function(require,module,exports){
var lol = 0;

function L(){
    this.id = lol;
    lol++;
    this.variables = [];
    this.constants = [];
    this.axiom;
    this.rules = [];
    
    this.output = "";
}

L.prototype.generate = function(iterations){
    this.output = this.axiom;
    var temp = "";
    for (var i = 0; i < iterations; i++) {
        for (var j = 0; j < this.output.length; j++) {
            
            var letter = this.output[j];
            if( this.constants.indexOf(letter) < 0){
                letter = this.rules[letter];
            } 
            
            temp += letter;
        }
        this.output = temp;
        temp = "";
    }
}

L.prototype.addconstants = function(constants){
    for (var i = 0; i < constants.length; i++) {
        this.constants.push(constants[i]);
    }
}

L.prototype.addVariables = function(variables){
    for (var i = 0; i < variables.length; i++) {
        this.variables.push(variables[i]);
    }
}

L.prototype.addRule = function(from,to){
    this.rules[from] = to;
}

L.prototype.clone = function(){
    var ret = new L();
    ret.variables = this.variables.slice();
    ret.constants = this.constants.slice();
    
    for(var key in this.rules)
    {
        ret.rules[key] = this.rules[key];
    }
    
    ret.axiom = this.axiom.slice();

    return ret;
}

L.prototype.mutate = function(){
    
    // var string = "";
    // for(var i in this.rules){
    //     string += i;
    //     string += ">" + this.rules[i] + "|";
    // }
    var string = this.rules["X"];

   var replacement = this.variables.concat(this.constants);
   
   
   this.rules["X"] = string.setCharAt(Math.floor(Math.random()*string.length),replacement[Math.floor(Math.random()*replacement.length)]);

}

module.exports = L;
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
var L = require("./L");
var Drawer = require("./Drawer");
var Ui = require("./Ui");


String.prototype.setCharAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
}


var elle = new L();
var div;
var drawerList = [];
var u = new Ui();

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

        console.log(drawerList[i].l.rules);

        drawerList[i].reset();
        drawerList[i].ctx.canvas.width = drawerList[i].ctx.canvas.width;
    }
    
    console.log("//");
    
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

},{"./Drawer":1,"./L":2,"./Ui":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL0RyYXdlci5qcyIsInNjcmlwdHMvTC5qcyIsInNjcmlwdHMvVWkuanMiLCJzY3JpcHRzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBEcmF3ZXIobFN5c3RlbSxjb250ZXh0LHN0YXJ0cG9zLGFuZ2xlLGppdHRlciA9IDApe1xuICAgIHRoaXMubCA9IGxTeXN0ZW07XG4gICAgdGhpcy5jYW1lcmFQb3MgPSB7eDowLHk6MH07XG4gICAgXG4gICAgdGhpcy5zdGFydEFyZ3VtZW50ID0ge3BvcyA6e3g6c3RhcnRwb3MueCx5OnN0YXJ0cG9zLnl9LCBkaXIgOiAtTWF0aC5QSSAvMn07XG4gICAgXG4gICAgdGhpcy5wb3NpdGlvbiA9IHt4OnN0YXJ0cG9zLngseTpzdGFydHBvcy55fVxuICAgIHRoaXMuZGlyZWN0aW9uID0gLU1hdGguUEkgLzI7XG4gICAgdGhpcy5zYXZlZFBvc2l0aW9uID0gW107XG4gICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgIHRoaXMuY3R4ID0gY29udGV4dDtcbiAgICB0aGlzLmppdHRlciA9IGppdHRlcjtcbiAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICBcbiAgICB0aGlzLmJ1ZmZlciA9IFtdO1xuICAgIHRoaXMubGluZUxlbmd0aCA9IDI7XG4gICAgdGhpcy5jdXJyZW50RHJhd0luZGV4ID0gMDtcbiAgICBcbiAgICAvL2RyYWcgbW92ZSBwYXJhbWV0ZXJzXG4gICAgdGhpcy5tb3VzZURvd24gPSBmYWxzZTtcbiAgICB0aGlzLmNsaWNrUG9zaXRpb247XG4gICAgXG4gICAgdGhpcy5jdHguY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIix0aGlzLm9uQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIix0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xuICAgIFxuICAgIHRoaXMuZHJhd2luZ0Z1bmN0aW9ucyA9IHtcbiAgICAgICAgXCJGXCIgOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlci5wdXNoKHt4OnRoaXMuY2FtZXJhUG9zLnggKyB0aGlzLnBvc2l0aW9uLngseTp0aGlzLmNhbWVyYVBvcy55ICsgdGhpcy5wb3NpdGlvbi55fSk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKnRoaXMubGluZUxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSA9IHRoaXMucG9zaXRpb24ueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqdGhpcy5saW5lTGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5idWZmZXIucHVzaCh7eDp0aGlzLmNhbWVyYVBvcy54ICsgdGhpcy5wb3NpdGlvbi54LHk6dGhpcy5jYW1lcmFQb3MueSArIHRoaXMucG9zaXRpb24ueX0pO1xuICAgICAgICB9LFxuICAgICAgICBcIitcIiA6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uICs9IHRoaXMuYW5nbGUgKyAoTWF0aC5yYW5kb20oKSoyIC0xKSp0aGlzLmppdHRlcjtcblxuICAgICAgICB9LFxuICAgICAgICBcIi1cIiA6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uIC09IHRoaXMuYW5nbGUgKyAoTWF0aC5yYW5kb20oKSoyIC0xKSp0aGlzLmppdHRlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIFwiW1wiIDogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlZFBvc2l0aW9uLnB1c2goe3Bvczp7eDp0aGlzLnBvc2l0aW9uLngseTp0aGlzLnBvc2l0aW9uLnl9LGRpcjp0aGlzLmRpcmVjdGlvbn0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcIl1cIiA6ICgpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYodGhpcy5zYXZlZFBvc2l0aW9uLmxlbmd0aCA9PSAwKXtcbiAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm5vbiBwb3BcIik7XG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzYXZlZCA9IHRoaXMuc2F2ZWRQb3NpdGlvbi5wb3AoKTtcbiAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gc2F2ZWQucG9zO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gc2F2ZWQuZGlyO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgfVxufVxuRHJhd2VyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50RHJhd0luZGV4ID0gMDtcbiAgICB0aGlzLmJ1ZmZlciA9IFtdO1xuICAgIHRoaXMuc2F2ZWRQb3NpdGlvbiA9IFtdO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gdGhpcy5zdGFydEFyZ3VtZW50LmRpcjtcbiAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLnN0YXJ0QXJndW1lbnQucG9zLng7XG4gICAgdGhpcy5wb3NpdGlvbi55ID0gdGhpcy5zdGFydEFyZ3VtZW50LnBvcy55O1xuICAgIFxufVxuXG5cbkRyYXdlci5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuY2xpY2tQb3NpdGlvbiA9IHt4OmUuY2xpZW50WCx5OmUuY2xpZW50WX07XG4gICAgdGhpcy5tb3VzZURvd24gPSB0cnVlOyAgICBcbn1cbkRyYXdlci5wcm90b3R5cGUub25Nb3VzZU1vdmUgPSBmdW5jdGlvbihlKXtcbiAgICBpZih0aGlzLm1vdXNlRG93bilcbiAgICB7XG4gICAgICAgIHRoaXMuY2FtZXJhUG9zLnggKz0gZS5jbGllbnRYIC0gdGhpcy5jbGlja1Bvc2l0aW9uLng7XG4gICAgICAgIHRoaXMuY2FtZXJhUG9zLnkgKz0gZS5jbGllbnRZIC0gdGhpcy5jbGlja1Bvc2l0aW9uLnk7XG4gICAgICAgIHRoaXMuY2xpY2tQb3NpdGlvbiA9IHt4OmUuY2xpZW50WCx5OmUuY2xpZW50WX07XG4gICAgfVxufVxuXG5EcmF3ZXIucHJvdG90eXBlLm9uTW91c2VVcCA9IGZ1bmN0aW9uKGUpe1xuICAgIHRoaXMubW91c2VEb3duID0gZmFsc2U7XG59XG5cbkRyYXdlci5wcm90b3R5cGUuZmlsbEJ1ZmZlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgdGhpcy5yZXNldCgpO1xuXG4gICAgaWYodGhpcy5sLm91dHB1dC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIHZhciBuYk9mRHJhd0FjdGlvbnMgPSAwO1xuICAgIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sLm91dHB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy5kcmF3aW5nRnVuY3Rpb25zW3RoaXMubC5vdXRwdXRbaV1dID09IHVuZGVmaW5lZCkgY29udGludWU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZHJhd2luZ0Z1bmN0aW9uc1t0aGlzLmwub3V0cHV0W2ldXS5jYWxsKHRoaXMpO1xuICAgICAgICBuYk9mRHJhd0FjdGlvbnMgKys7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbn1cblxuRHJhd2VyLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24obmIpe1xuICAgIHRoaXMuZmlsbEJ1ZmZlcigpO1xuICAgIFxuICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCA9dGhpcy5jdHguY2FudmFzLndpZHRoO1xuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2JhKDAsMCwwLDEpXCI7XG4gICAgXG4gICAgXG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmJ1ZmZlci5sZW5ndGg7IGorPTIpIHtcbiAgICAgICAgICAgdmFyIHBvcyA9IHRoaXMuYnVmZmVyW2pdO1xuICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8ocG9zLngscG9zLnkpO1xuICAgICAgICAgICBwb3MgPSB0aGlzLmJ1ZmZlcltqKzFdO1xuICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8ocG9zLngscG9zLnkpO1xuICAgICAgICB9XG4gICAgICAgICAgIFxuICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRHJhd2VyOyIsInZhciBsb2wgPSAwO1xuXG5mdW5jdGlvbiBMKCl7XG4gICAgdGhpcy5pZCA9IGxvbDtcbiAgICBsb2wrKztcbiAgICB0aGlzLnZhcmlhYmxlcyA9IFtdO1xuICAgIHRoaXMuY29uc3RhbnRzID0gW107XG4gICAgdGhpcy5heGlvbTtcbiAgICB0aGlzLnJ1bGVzID0gW107XG4gICAgXG4gICAgdGhpcy5vdXRwdXQgPSBcIlwiO1xufVxuXG5MLnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uKGl0ZXJhdGlvbnMpe1xuICAgIHRoaXMub3V0cHV0ID0gdGhpcy5heGlvbTtcbiAgICB2YXIgdGVtcCA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLm91dHB1dC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbGV0dGVyID0gdGhpcy5vdXRwdXRbal07XG4gICAgICAgICAgICBpZiggdGhpcy5jb25zdGFudHMuaW5kZXhPZihsZXR0ZXIpIDwgMCl7XG4gICAgICAgICAgICAgICAgbGV0dGVyID0gdGhpcy5ydWxlc1tsZXR0ZXJdO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGVtcCArPSBsZXR0ZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vdXRwdXQgPSB0ZW1wO1xuICAgICAgICB0ZW1wID0gXCJcIjtcbiAgICB9XG59XG5cbkwucHJvdG90eXBlLmFkZGNvbnN0YW50cyA9IGZ1bmN0aW9uKGNvbnN0YW50cyl7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25zdGFudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5jb25zdGFudHMucHVzaChjb25zdGFudHNbaV0pO1xuICAgIH1cbn1cblxuTC5wcm90b3R5cGUuYWRkVmFyaWFibGVzID0gZnVuY3Rpb24odmFyaWFibGVzKXtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnZhcmlhYmxlcy5wdXNoKHZhcmlhYmxlc1tpXSk7XG4gICAgfVxufVxuXG5MLnByb3RvdHlwZS5hZGRSdWxlID0gZnVuY3Rpb24oZnJvbSx0byl7XG4gICAgdGhpcy5ydWxlc1tmcm9tXSA9IHRvO1xufVxuXG5MLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHJldCA9IG5ldyBMKCk7XG4gICAgcmV0LnZhcmlhYmxlcyA9IHRoaXMudmFyaWFibGVzLnNsaWNlKCk7XG4gICAgcmV0LmNvbnN0YW50cyA9IHRoaXMuY29uc3RhbnRzLnNsaWNlKCk7XG4gICAgXG4gICAgZm9yKHZhciBrZXkgaW4gdGhpcy5ydWxlcylcbiAgICB7XG4gICAgICAgIHJldC5ydWxlc1trZXldID0gdGhpcy5ydWxlc1trZXldO1xuICAgIH1cbiAgICBcbiAgICByZXQuYXhpb20gPSB0aGlzLmF4aW9tLnNsaWNlKCk7XG5cbiAgICByZXR1cm4gcmV0O1xufVxuXG5MLnByb3RvdHlwZS5tdXRhdGUgPSBmdW5jdGlvbigpe1xuICAgIFxuICAgIC8vIHZhciBzdHJpbmcgPSBcIlwiO1xuICAgIC8vIGZvcih2YXIgaSBpbiB0aGlzLnJ1bGVzKXtcbiAgICAvLyAgICAgc3RyaW5nICs9IGk7XG4gICAgLy8gICAgIHN0cmluZyArPSBcIj5cIiArIHRoaXMucnVsZXNbaV0gKyBcInxcIjtcbiAgICAvLyB9XG4gICAgdmFyIHN0cmluZyA9IHRoaXMucnVsZXNbXCJYXCJdO1xuXG4gICB2YXIgcmVwbGFjZW1lbnQgPSB0aGlzLnZhcmlhYmxlcy5jb25jYXQodGhpcy5jb25zdGFudHMpO1xuICAgXG4gICBcbiAgIHRoaXMucnVsZXNbXCJYXCJdID0gc3RyaW5nLnNldENoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqc3RyaW5nLmxlbmd0aCkscmVwbGFjZW1lbnRbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnJlcGxhY2VtZW50Lmxlbmd0aCldKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEw7IiwiZnVuY3Rpb24gVWkoKXtcbiAgICBcbiAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIub3B0aW9uc1wiKTtcbiAgICBcbiAgICB0aGlzLmFuZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hbmdsZVwiKTtcbiAgICB0aGlzLmFuZ2xlLnR5cGUgPSBcInJhbmdlXCI7XG4gICAvLyB0aGlzLmFuZ2xlLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXG4gICAgdGhpcy5hbmdsZS5taW4gPSAtTWF0aC5QSTtcbiAgICB0aGlzLmFuZ2xlLm1heCA9IE1hdGguUEk7XG4gICAgdGhpcy5hbmdsZS5zdGVwID0gMC4wMDE7XG4gICAgdGhpcy5hbmdsZS52YWx1ZSA9IE1hdGguUEkgLzU7XG4gICAgY29uc29sZS5sb2codGhpcy5hbmdsZS52YWx1ZSk7XG5cbiAgICB0aGlzLmxlbmd0aCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubGVuZ3RoXCIpO1xuICAgIHRoaXMubGVuZ3RoLnR5cGUgPSBcInJhbmdlXCI7XG4gICAvLyB0aGlzLmxlbmd0aC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblxuICAgIFxuICAgIHRoaXMubGVuZ3RoLm1pbiA9IDAuMDtcbiAgICB0aGlzLmxlbmd0aC5tYXggPSAxMDtcbiAgICB0aGlzLmxlbmd0aC5zdGVwID0gMC4wMDE7XG4gICAgXG4gICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAgVWk7IiwidmFyIEwgPSByZXF1aXJlKFwiLi9MXCIpO1xudmFyIERyYXdlciA9IHJlcXVpcmUoXCIuL0RyYXdlclwiKTtcbnZhciBVaSA9IHJlcXVpcmUoXCIuL1VpXCIpO1xuXG5cblN0cmluZy5wcm90b3R5cGUuc2V0Q2hhckF0ID0gZnVuY3Rpb24oaW5kZXgsIGNoYXJhY3Rlcikge1xuXHRyZXR1cm4gdGhpcy5zdWJzdHIoMCwgaW5kZXgpICsgY2hhcmFjdGVyICsgdGhpcy5zdWJzdHIoaW5kZXgrY2hhcmFjdGVyLmxlbmd0aCk7XG59XG5cblxudmFyIGVsbGUgPSBuZXcgTCgpO1xudmFyIGRpdjtcbnZhciBkcmF3ZXJMaXN0ID0gW107XG52YXIgdSA9IG5ldyBVaSgpO1xuXG52YXIgbWF4SXRlcmF0aW9uID0gNTtcblxudmFyIHBsYW50SW5mb3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYW50SW5mb3NcIik7XG5cbmZ1bmN0aW9uIGluaXQoKXtcbiAgICBlbGxlLmFkZFZhcmlhYmxlcyhcIlhGXCIpO1xuICAgIGVsbGUuYWRkY29uc3RhbnRzKFwiKy1bXVwiKTtcbiAgICBlbGxlLmF4aW9tID0gXCJYXCI7XG4gICAgZWxsZS5hZGRSdWxlKFwiWFwiLFwiRi1bW1hdK1hdK0ZbK0ZYXS1YXCIpO1xuICAgIGVsbGUuYWRkUnVsZShcIkZcIixcIkZGXCIpO1xuICAgIGVsbGUuZ2VuZXJhdGUobWF4SXRlcmF0aW9uKTtcbiAgICBcbiAgICBkaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhbnZhc2VzXCIpO1xuICAgXG4gICAgdmFyIGNhbnZhc2VzID0gZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJjYW52YXNcIik7IFxuICAgIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FudmFzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSBjYW52YXNlc1tpXVxuICAgICAgICBcbiAgICAgICAgdmFyIGN0eCA9IGMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB2YXIgZHJhd2VyID0gbmV3IERyYXdlcihlbGxlLGN0eCx7eDpjLndpZHRoLzIseTpjLmhlaWdodC8yfSxNYXRoLlBJLzUsMCk7XG4gICAgICAgIGRyYXdlckxpc3QucHVzaChkcmF3ZXIpO1xuICAgICAgICBjdHguY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIixvbkRyYXdlck1vdXNlQ2xpY2suYmluZChkcmF3ZXIpKSAgICAgXG4gICAgfVxuICAgIHJlc2l6ZSgpO1xuICAgIG11dGF0ZUZyb21Nb2RlbChlbGxlKTtcbn1cblxuZnVuY3Rpb24gcmVzaXplKCl7XG4gICAgXG4gICAgdmFyIGNvbnRhaW5lckJCID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBcbiAgICBcbiAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjID0gZHJhd2VyTGlzdFtpXS5jdHguY2FudmFzO1xuICAgICAgICB2YXIgZmxvb3JlZFNxcnQgPSBNYXRoLnNxcnQoZHJhd2VyTGlzdC5sZW5ndGgpO1xuICAgICAgICAgXG4gICAgICAgIHZhciBkZWZhdWx0V2lkdGggPSBNYXRoLmZsb29yKGNvbnRhaW5lckJCLndpZHRoL2Zsb29yZWRTcXJ0KTtcbiAgICAgICAgdmFyIGRlZmF1bHRIZWlnaHQgPSBNYXRoLmZsb29yKGNvbnRhaW5lckJCLmhlaWdodC9mbG9vcmVkU3FydCk7XG4gICAgICAgIFxuICAgICAgICAgYy53aWR0aCA9IGRlZmF1bHRXaWR0aDtcbiAgICAgICAgIGMuaGVpZ2h0ID0gZGVmYXVsdEhlaWdodDtcbiAgICAgICAgIGMuc3R5bGUubGVmdCA9IChkZWZhdWx0V2lkdGggKiAoaSVmbG9vcmVkU3FydCkpICsgXCJweFwiO1xuICAgICAgICAgYy5zdHlsZS50b3AgPSAoZGVmYXVsdEhlaWdodCAqIE1hdGguZmxvb3IoaS9mbG9vcmVkU3FydCkpICsgXCJweFwiO1xuICAgICB9XG59XG5cbmZ1bmN0aW9uIG11dGF0ZUZyb21Nb2RlbChiYXNlU3lzdGVtKVxue1xuICAgIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJhd2VyTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2xvbmUgPSBiYXNlU3lzdGVtLmNsb25lKCk7XG4gICAgICAgIGNsb25lLm11dGF0ZSgpO1xuICAgICAgICBjbG9uZS5nZW5lcmF0ZShtYXhJdGVyYXRpb24pO1xuICAgICAgICBcblxuICAgICAgICBkcmF3ZXJMaXN0W2ldLmwgPSBjbG9uZTtcblxuICAgICAgICBjb25zb2xlLmxvZyhkcmF3ZXJMaXN0W2ldLmwucnVsZXMpO1xuXG4gICAgICAgIGRyYXdlckxpc3RbaV0ucmVzZXQoKTtcbiAgICAgICAgZHJhd2VyTGlzdFtpXS5jdHguY2FudmFzLndpZHRoID0gZHJhd2VyTGlzdFtpXS5jdHguY2FudmFzLndpZHRoO1xuICAgIH1cbiAgICBcbiAgICBjb25zb2xlLmxvZyhcIi8vXCIpO1xuICAgIFxufVxuXG4oZnVuY3Rpb24gbG9vcCh0aW1lKXtcbiAgICB2YXIgc2hpdHRvZHJhd2xlbmd0aCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vdXBkYXRlIFVJXG4gICAgICAgIGRyYXdlckxpc3RbaV0uYW5nbGUgPSBwYXJzZUZsb2F0KHUuYW5nbGUudmFsdWUpO1xuICAgICAgICBkcmF3ZXJMaXN0W2ldLmxpbmVMZW5ndGggPSBwYXJzZUZsb2F0KHUubGVuZ3RoLnZhbHVlKTtcbiAgICAgICAgXG4gICAgICAgIGRyYXdlckxpc3RbaV0uZHJhdygpO1xuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG59KSgwKTtcblxuXG5mdW5jdGlvbiBvbkRyYXdlck1vdXNlQ2xpY2soKXtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyYXdlckxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZHJhd2VyTGlzdFtpXS5jdHguY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAvLyBjb25zb2xlLmxvZyhkcmF3ZXJMaXN0W2ldLmwucnVsZXMpO1xuICAgICAgICBcbiAgICB9XG4gICAgdGhpcy5jdHguY2FudmFzLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcbiAgIC8vIGNvbnNvbGUubG9nKHRoaXMubC5ydWxlcyk7XG4gICAgXG4gIC8vICB0aGlzLmN0eC5jYW52YXMud2lkdGggLT0gNTA7IFxuLy8gICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgLT0gNTA7IFxuICAgICBwbGFudEluZm9zLmlubmVySFRNTCA9IFwiXCI7XG4gICAgLy9tb3ZlIHRvIGxzeXN0ZW0gbWV0aG9kO1xuICAgIGZvcih2YXIgaSBpbiB0aGlzLmwucnVsZXMpe1xuICAgICAgICBwbGFudEluZm9zLmlubmVySFRNTCArPSBpICsgXCI8YnIvPlwiO1xuICAgICAgICBwbGFudEluZm9zLmlubmVySFRNTCArPSB0aGlzLmwucnVsZXNbaV0gK1wiPGJyLz5cIjtcbiAgICAgICAgXG4gICAgfVxuICAgXG59XG5cblxuXG53aW5kb3cub25yZXNpemUgPSByZXNpemU7XG53aW5kb3cub25sb2FkID0gaW5pdDtcbiJdfQ==
