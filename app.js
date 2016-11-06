(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ui = require("./Ui");

function Drawer(lSystem,context,startpos,angle,jitter = 0){
    this.l = lSystem;
    this.cameraPos = {x:0,y:0};
    
    this.startArgument = {pos :{x:startpos.x,y:startpos.y}, dir : -Math.PI /2};
    
    this.position = {x:startpos.x,y:startpos.y}
    this.direction = -Math.PI /2;
    this.savedPosition = [];
    //this.angle = angle;
    this.ctx = context;
    this.jitter = jitter;
    this.done = false;
    
    this.buffer = [];
    this.lineLength = 2;
    this.currentDrawIndex = 0;
    
    //drag move parameters
    this.mouseDown = false;
    this.clickPosition;
    this.ui = new Ui();

    this.ctx.canvas.addEventListener("mousedown",this.onClick.bind(this));
    window.addEventListener("mousemove",this.onMouseMove.bind(this));
    window.addEventListener("mouseup",this.onMouseUp.bind(this));
    
    this.drawingFunctions = {
        "F" : () => {
            this.buffer.push({x:this.cameraPos.x + this.position.x,y:this.cameraPos.y + this.position.y});
            this.position.x = this.position.x + Math.cos(this.direction) *this.ui.getParam("lineLength");
            this.position.y = this.position.y + Math.sin(this.direction) *this.ui.getParam("lineLength");
            this.buffer.push({x:this.cameraPos.x + this.position.x,y:this.cameraPos.y + this.position.y});
        },
        "+" : () => {
            this.direction += this.ui.getParam("angle") + (Math.random()*2 -1)*this.jitter;

        },
        "-" : () => {
            this.direction -= this.ui.getParam("angle") + (Math.random()*2 -1)*this.jitter;
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
},{"./Ui":4}],2:[function(require,module,exports){
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

},{"./Drawer":1,"./L":2}],4:[function(require,module,exports){
var container = document.querySelector(".options")
var DomAngle = document.querySelector(".angle");
var DomLength = document.querySelector(".length");
    
DomAngle.type = "range";
// this.angle.style.position = "absolute";

DomAngle.min = -Math.PI;
DomAngle.max = Math.PI;
DomAngle.step = 0.001;
DomAngle.value = Math.PI /5;

DomLength.type = "range";
// this.length.style.position = "absolute";


DomLength.min = 0.0;
DomLength.max = 10;
DomLength.step = 0.001;


function Parameter (name,domEl){
    this.name = name;
    this.domElement = domEl;
    this.value = parseFloat(domEl.value);
}


function Ui(){
    
    //mb do something like parameters[domel] = val; 
    this.parameters = [];
    this.parameters["angle"] = new Parameter("angle",DomAngle);
    this.parameters["lineLength"] = new Parameter("lineLength",DomLength);
    
    for(var param in this.parameters)
        {        
            (function(param){
                
            
                
            this.parameters[param].domElement.addEventListener("input",function(){
            this.onValueChange(this.parameters[param]);
            }.bind(this));
            }.bind(this))(param)
        }

}

Ui.prototype.onValueChange = function(param){
    
    console.log(param.domElement.value);
    
    param.value = parseFloat(param.domElement.value);
}

Ui.prototype.getParam = function(name){
     return this.parameters[name].value;
}


module.exports =  Ui;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRHJhd2VyLmpzIiwic3JjL0wuanMiLCJzcmMvTWFpbi5qcyIsInNyYy9VaS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBVaSA9IHJlcXVpcmUoXCIuL1VpXCIpO1xuXG5mdW5jdGlvbiBEcmF3ZXIobFN5c3RlbSxjb250ZXh0LHN0YXJ0cG9zLGFuZ2xlLGppdHRlciA9IDApe1xuICAgIHRoaXMubCA9IGxTeXN0ZW07XG4gICAgdGhpcy5jYW1lcmFQb3MgPSB7eDowLHk6MH07XG4gICAgXG4gICAgdGhpcy5zdGFydEFyZ3VtZW50ID0ge3BvcyA6e3g6c3RhcnRwb3MueCx5OnN0YXJ0cG9zLnl9LCBkaXIgOiAtTWF0aC5QSSAvMn07XG4gICAgXG4gICAgdGhpcy5wb3NpdGlvbiA9IHt4OnN0YXJ0cG9zLngseTpzdGFydHBvcy55fVxuICAgIHRoaXMuZGlyZWN0aW9uID0gLU1hdGguUEkgLzI7XG4gICAgdGhpcy5zYXZlZFBvc2l0aW9uID0gW107XG4gICAgLy90aGlzLmFuZ2xlID0gYW5nbGU7XG4gICAgdGhpcy5jdHggPSBjb250ZXh0O1xuICAgIHRoaXMuaml0dGVyID0gaml0dGVyO1xuICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIFxuICAgIHRoaXMuYnVmZmVyID0gW107XG4gICAgdGhpcy5saW5lTGVuZ3RoID0gMjtcbiAgICB0aGlzLmN1cnJlbnREcmF3SW5kZXggPSAwO1xuICAgIFxuICAgIC8vZHJhZyBtb3ZlIHBhcmFtZXRlcnNcbiAgICB0aGlzLm1vdXNlRG93biA9IGZhbHNlO1xuICAgIHRoaXMuY2xpY2tQb3NpdGlvbjtcbiAgICB0aGlzLnVpID0gbmV3IFVpKCk7XG5cbiAgICB0aGlzLmN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLHRoaXMub25DbGljay5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgXG4gICAgdGhpcy5kcmF3aW5nRnVuY3Rpb25zID0ge1xuICAgICAgICBcIkZcIiA6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLnB1c2goe3g6dGhpcy5jYW1lcmFQb3MueCArIHRoaXMucG9zaXRpb24ueCx5OnRoaXMuY2FtZXJhUG9zLnkgKyB0aGlzLnBvc2l0aW9uLnl9KTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHRoaXMucG9zaXRpb24ueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqdGhpcy51aS5nZXRQYXJhbShcImxpbmVMZW5ndGhcIik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSB0aGlzLnBvc2l0aW9uLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKnRoaXMudWkuZ2V0UGFyYW0oXCJsaW5lTGVuZ3RoXCIpO1xuICAgICAgICAgICAgdGhpcy5idWZmZXIucHVzaCh7eDp0aGlzLmNhbWVyYVBvcy54ICsgdGhpcy5wb3NpdGlvbi54LHk6dGhpcy5jYW1lcmFQb3MueSArIHRoaXMucG9zaXRpb24ueX0pO1xuICAgICAgICB9LFxuICAgICAgICBcIitcIiA6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uICs9IHRoaXMudWkuZ2V0UGFyYW0oXCJhbmdsZVwiKSArIChNYXRoLnJhbmRvbSgpKjIgLTEpKnRoaXMuaml0dGVyO1xuXG4gICAgICAgIH0sXG4gICAgICAgIFwiLVwiIDogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gLT0gdGhpcy51aS5nZXRQYXJhbShcImFuZ2xlXCIpICsgKE1hdGgucmFuZG9tKCkqMiAtMSkqdGhpcy5qaXR0ZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICBcIltcIiA6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZWRQb3NpdGlvbi5wdXNoKHtwb3M6e3g6dGhpcy5wb3NpdGlvbi54LHk6dGhpcy5wb3NpdGlvbi55fSxkaXI6dGhpcy5kaXJlY3Rpb259KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXCJdXCIgOiAoKSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHRoaXMuc2F2ZWRQb3NpdGlvbi5sZW5ndGggPT0gMCl7XG4gICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJub24gcG9wXCIpO1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgc2F2ZWQgPSB0aGlzLnNhdmVkUG9zaXRpb24ucG9wKCk7XG4gICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHNhdmVkLnBvcztcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IHNhdmVkLmRpcjtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgIH1cbn1cbkRyYXdlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIHRoaXMuY3VycmVudERyYXdJbmRleCA9IDA7XG4gICAgdGhpcy5idWZmZXIgPSBbXTtcbiAgICB0aGlzLnNhdmVkUG9zaXRpb24gPSBbXTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMuc3RhcnRBcmd1bWVudC5kaXI7XG4gICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5zdGFydEFyZ3VtZW50LnBvcy54O1xuICAgIHRoaXMucG9zaXRpb24ueSA9IHRoaXMuc3RhcnRBcmd1bWVudC5wb3MueTtcbiAgICBcbn1cblxuXG5EcmF3ZXIucHJvdG90eXBlLm9uQ2xpY2sgPSBmdW5jdGlvbihlKXtcbiAgICB0aGlzLmNsaWNrUG9zaXRpb24gPSB7eDplLmNsaWVudFgseTplLmNsaWVudFl9O1xuICAgIHRoaXMubW91c2VEb3duID0gdHJ1ZTsgICAgXG59XG5EcmF3ZXIucHJvdG90eXBlLm9uTW91c2VNb3ZlID0gZnVuY3Rpb24oZSl7XG4gICAgaWYodGhpcy5tb3VzZURvd24pXG4gICAge1xuICAgICAgICB0aGlzLmNhbWVyYVBvcy54ICs9IGUuY2xpZW50WCAtIHRoaXMuY2xpY2tQb3NpdGlvbi54O1xuICAgICAgICB0aGlzLmNhbWVyYVBvcy55ICs9IGUuY2xpZW50WSAtIHRoaXMuY2xpY2tQb3NpdGlvbi55O1xuICAgICAgICB0aGlzLmNsaWNrUG9zaXRpb24gPSB7eDplLmNsaWVudFgseTplLmNsaWVudFl9O1xuICAgIH1cbn1cblxuRHJhd2VyLnByb3RvdHlwZS5vbk1vdXNlVXAgPSBmdW5jdGlvbihlKXtcbiAgICB0aGlzLm1vdXNlRG93biA9IGZhbHNlO1xufVxuXG5EcmF3ZXIucHJvdG90eXBlLmZpbGxCdWZmZXIgPSBmdW5jdGlvbigpe1xuICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgIGlmKHRoaXMubC5vdXRwdXQubGVuZ3RoID09IDApIHJldHVybjtcbiAgICB2YXIgbmJPZkRyYXdBY3Rpb25zID0gMDtcbiAgICBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubC5vdXRwdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuZHJhd2luZ0Z1bmN0aW9uc1t0aGlzLmwub3V0cHV0W2ldXSA9PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB0aGlzLmRyYXdpbmdGdW5jdGlvbnNbdGhpcy5sLm91dHB1dFtpXV0uY2FsbCh0aGlzKTtcbiAgICAgICAgbmJPZkRyYXdBY3Rpb25zICsrO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG59XG5cbkRyYXdlci5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKG5iKXtcbiAgICB0aGlzLmZpbGxCdWZmZXIoKTtcbiAgICBcbiAgICB0aGlzLmN0eC5jYW52YXMud2lkdGggPXRoaXMuY3R4LmNhbnZhcy53aWR0aDtcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwicmdiYSgwLDAsMCwxKVwiO1xuICAgIFxuICAgIFxuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5idWZmZXIubGVuZ3RoOyBqKz0yKSB7XG4gICAgICAgICAgIHZhciBwb3MgPSB0aGlzLmJ1ZmZlcltqXTtcbiAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHBvcy54LHBvcy55KTtcbiAgICAgICAgICAgcG9zID0gdGhpcy5idWZmZXJbaisxXTtcbiAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHBvcy54LHBvcy55KTtcbiAgICAgICAgfVxuICAgICAgICAgICBcbiAgICB0aGlzLmN0eC5zdHJva2UoKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERyYXdlcjsiLCJ2YXIgbG9sID0gMDtcblxuZnVuY3Rpb24gTCgpe1xuICAgIHRoaXMuaWQgPSBsb2w7XG4gICAgbG9sKys7XG4gICAgdGhpcy52YXJpYWJsZXMgPSBbXTtcbiAgICB0aGlzLmNvbnN0YW50cyA9IFtdO1xuICAgIHRoaXMuYXhpb207XG4gICAgdGhpcy5ydWxlcyA9IFtdO1xuICAgIFxuICAgIHRoaXMub3V0cHV0ID0gXCJcIjtcbn1cblxuTC5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbihpdGVyYXRpb25zKXtcbiAgICB0aGlzLm91dHB1dCA9IHRoaXMuYXhpb207XG4gICAgdmFyIHRlbXAgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5vdXRwdXQubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGxldHRlciA9IHRoaXMub3V0cHV0W2pdO1xuICAgICAgICAgICAgaWYoIHRoaXMuY29uc3RhbnRzLmluZGV4T2YobGV0dGVyKSA8IDApe1xuICAgICAgICAgICAgICAgIGxldHRlciA9IHRoaXMucnVsZXNbbGV0dGVyXTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRlbXAgKz0gbGV0dGVyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub3V0cHV0ID0gdGVtcDtcbiAgICAgICAgdGVtcCA9IFwiXCI7XG4gICAgfVxufVxuXG5MLnByb3RvdHlwZS5hZGRjb25zdGFudHMgPSBmdW5jdGlvbihjb25zdGFudHMpe1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uc3RhbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuY29uc3RhbnRzLnB1c2goY29uc3RhbnRzW2ldKTtcbiAgICB9XG59XG5cbkwucHJvdG90eXBlLmFkZFZhcmlhYmxlcyA9IGZ1bmN0aW9uKHZhcmlhYmxlcyl7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YXJpYWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMucHVzaCh2YXJpYWJsZXNbaV0pO1xuICAgIH1cbn1cblxuTC5wcm90b3R5cGUuYWRkUnVsZSA9IGZ1bmN0aW9uKGZyb20sdG8pe1xuICAgIHRoaXMucnVsZXNbZnJvbV0gPSB0bztcbn1cblxuTC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpe1xuICAgIHZhciByZXQgPSBuZXcgTCgpO1xuICAgIHJldC52YXJpYWJsZXMgPSB0aGlzLnZhcmlhYmxlcy5zbGljZSgpO1xuICAgIHJldC5jb25zdGFudHMgPSB0aGlzLmNvbnN0YW50cy5zbGljZSgpO1xuICAgIFxuICAgIGZvcih2YXIga2V5IGluIHRoaXMucnVsZXMpXG4gICAge1xuICAgICAgICByZXQucnVsZXNba2V5XSA9IHRoaXMucnVsZXNba2V5XTtcbiAgICB9XG4gICAgXG4gICAgcmV0LmF4aW9tID0gdGhpcy5heGlvbS5zbGljZSgpO1xuXG4gICAgcmV0dXJuIHJldDtcbn1cblxuTC5wcm90b3R5cGUubXV0YXRlID0gZnVuY3Rpb24oKXtcbiAgICBcbiAgICAvLyB2YXIgc3RyaW5nID0gXCJcIjtcbiAgICAvLyBmb3IodmFyIGkgaW4gdGhpcy5ydWxlcyl7XG4gICAgLy8gICAgIHN0cmluZyArPSBpO1xuICAgIC8vICAgICBzdHJpbmcgKz0gXCI+XCIgKyB0aGlzLnJ1bGVzW2ldICsgXCJ8XCI7XG4gICAgLy8gfVxuICAgIHZhciBzdHJpbmcgPSB0aGlzLnJ1bGVzW1wiWFwiXTtcblxuICAgdmFyIHJlcGxhY2VtZW50ID0gdGhpcy52YXJpYWJsZXMuY29uY2F0KHRoaXMuY29uc3RhbnRzKTtcbiAgIFxuICAgXG4gICB0aGlzLnJ1bGVzW1wiWFwiXSA9IHN0cmluZy5zZXRDaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnN0cmluZy5sZW5ndGgpLHJlcGxhY2VtZW50W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpyZXBsYWNlbWVudC5sZW5ndGgpXSk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMOyIsInZhciBMID0gcmVxdWlyZShcIi4vTFwiKTtcbnZhciBEcmF3ZXIgPSByZXF1aXJlKFwiLi9EcmF3ZXJcIik7XG4vL3ZhciBVaSA9IHJlcXVpcmUoXCIuL1VpXCIpO1xuXG5cblN0cmluZy5wcm90b3R5cGUuc2V0Q2hhckF0ID0gZnVuY3Rpb24oaW5kZXgsIGNoYXJhY3Rlcikge1xuXHRyZXR1cm4gdGhpcy5zdWJzdHIoMCwgaW5kZXgpICsgY2hhcmFjdGVyICsgdGhpcy5zdWJzdHIoaW5kZXgrY2hhcmFjdGVyLmxlbmd0aCk7XG59XG5cblxudmFyIGVsbGUgPSBuZXcgTCgpO1xudmFyIGRpdjtcbnZhciBkcmF3ZXJMaXN0ID0gW107XG5cbnZhciBtYXhJdGVyYXRpb24gPSA1O1xuXG52YXIgcGxhbnRJbmZvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxhbnRJbmZvc1wiKTtcblxuZnVuY3Rpb24gaW5pdCgpe1xuICAgIGVsbGUuYWRkVmFyaWFibGVzKFwiWEZcIik7XG4gICAgZWxsZS5hZGRjb25zdGFudHMoXCIrLVtdXCIpO1xuICAgIGVsbGUuYXhpb20gPSBcIlhcIjtcbiAgICBlbGxlLmFkZFJ1bGUoXCJYXCIsXCJGLVtbWF0rWF0rRlsrRlhdLVhcIik7XG4gICAgZWxsZS5hZGRSdWxlKFwiRlwiLFwiRkZcIik7XG4gICAgZWxsZS5nZW5lcmF0ZShtYXhJdGVyYXRpb24pO1xuICAgIFxuICAgIGRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FudmFzZXNcIik7XG4gICBcbiAgICB2YXIgY2FudmFzZXMgPSBkaXYucXVlcnlTZWxlY3RvckFsbChcImNhbnZhc1wiKTsgXG4gICAgXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW52YXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IGNhbnZhc2VzW2ldXG4gICAgICAgIFxuICAgICAgICB2YXIgY3R4ID0gYy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIHZhciBkcmF3ZXIgPSBuZXcgRHJhd2VyKGVsbGUsY3R4LHt4OmMud2lkdGgvMix5OmMuaGVpZ2h0LzJ9LE1hdGguUEkvNSwwKTtcbiAgICAgICAgZHJhd2VyTGlzdC5wdXNoKGRyYXdlcik7XG4gICAgICAgIGN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLG9uRHJhd2VyTW91c2VDbGljay5iaW5kKGRyYXdlcikpICAgICBcbiAgICB9XG4gICAgcmVzaXplKCk7XG4gICAgbXV0YXRlRnJvbU1vZGVsKGVsbGUpO1xufVxuXG5mdW5jdGlvbiByZXNpemUoKXtcbiAgICBcbiAgICB2YXIgY29udGFpbmVyQkIgPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIFxuICAgIFxuICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyYXdlckxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSBkcmF3ZXJMaXN0W2ldLmN0eC5jYW52YXM7XG4gICAgICAgIHZhciBmbG9vcmVkU3FydCA9IE1hdGguc3FydChkcmF3ZXJMaXN0Lmxlbmd0aCk7XG4gICAgICAgICBcbiAgICAgICAgdmFyIGRlZmF1bHRXaWR0aCA9IE1hdGguZmxvb3IoY29udGFpbmVyQkIud2lkdGgvZmxvb3JlZFNxcnQpO1xuICAgICAgICB2YXIgZGVmYXVsdEhlaWdodCA9IE1hdGguZmxvb3IoY29udGFpbmVyQkIuaGVpZ2h0L2Zsb29yZWRTcXJ0KTtcbiAgICAgICAgXG4gICAgICAgICBjLndpZHRoID0gZGVmYXVsdFdpZHRoO1xuICAgICAgICAgYy5oZWlnaHQgPSBkZWZhdWx0SGVpZ2h0O1xuICAgICAgICAgYy5zdHlsZS5sZWZ0ID0gKGRlZmF1bHRXaWR0aCAqIChpJWZsb29yZWRTcXJ0KSkgKyBcInB4XCI7XG4gICAgICAgICBjLnN0eWxlLnRvcCA9IChkZWZhdWx0SGVpZ2h0ICogTWF0aC5mbG9vcihpL2Zsb29yZWRTcXJ0KSkgKyBcInB4XCI7XG4gICAgIH1cbn1cblxuZnVuY3Rpb24gbXV0YXRlRnJvbU1vZGVsKGJhc2VTeXN0ZW0pXG57XG4gICAgXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjbG9uZSA9IGJhc2VTeXN0ZW0uY2xvbmUoKTtcbiAgICAgICAgY2xvbmUubXV0YXRlKCk7XG4gICAgICAgIGNsb25lLmdlbmVyYXRlKG1heEl0ZXJhdGlvbik7XG4gICAgICAgIFxuXG4gICAgICAgIGRyYXdlckxpc3RbaV0ubCA9IGNsb25lO1xuXG5cbiAgICAgICAgZHJhd2VyTGlzdFtpXS5yZXNldCgpO1xuICAgICAgICBkcmF3ZXJMaXN0W2ldLmN0eC5jYW52YXMud2lkdGggPSBkcmF3ZXJMaXN0W2ldLmN0eC5jYW52YXMud2lkdGg7XG4gICAgfVxufVxuXG4oZnVuY3Rpb24gbG9vcCh0aW1lKXtcbiAgICB2YXIgc2hpdHRvZHJhd2xlbmd0aCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vdXBkYXRlIFVJXG4gICAvLyAgICAgZHJhd2VyTGlzdFtpXS5hbmdsZSA9IHBhcnNlRmxvYXQodS5hbmdsZSk7XG4vLyAgICAgICAgZHJhd2VyTGlzdFtpXS5saW5lTGVuZ3RoID0gcGFyc2VGbG9hdCh1Lmxlbmd0aCk7XG4gICAgICAgIFxuICAgICAgICBkcmF3ZXJMaXN0W2ldLmRyYXcoKTtcbiAgICB9XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xufSkoMCk7XG5cblxuZnVuY3Rpb24gb25EcmF3ZXJNb3VzZUNsaWNrKCl7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRyYXdlckxpc3RbaV0uY3R4LmNhbnZhcy5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XG4gICAgICAgLy8gY29uc29sZS5sb2coZHJhd2VyTGlzdFtpXS5sLnJ1bGVzKTtcbiAgICAgICAgXG4gICAgfVxuICAgIHRoaXMuY3R4LmNhbnZhcy5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XG4gICAvLyBjb25zb2xlLmxvZyh0aGlzLmwucnVsZXMpO1xuICAgIFxuICAvLyAgdGhpcy5jdHguY2FudmFzLndpZHRoIC09IDUwOyBcbi8vICAgICB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0IC09IDUwOyBcbiAgICAgcGxhbnRJbmZvcy5pbm5lckhUTUwgPSBcIlwiO1xuICAgIC8vbW92ZSB0byBsc3lzdGVtIG1ldGhvZDtcbiAgICBmb3IodmFyIGkgaW4gdGhpcy5sLnJ1bGVzKXtcbiAgICAgICAgcGxhbnRJbmZvcy5pbm5lckhUTUwgKz0gaSArIFwiPGJyLz5cIjtcbiAgICAgICAgcGxhbnRJbmZvcy5pbm5lckhUTUwgKz0gdGhpcy5sLnJ1bGVzW2ldICtcIjxici8+XCI7XG4gICAgICAgIFxuICAgIH1cbiAgIFxufVxuXG5cblxud2luZG93Lm9ucmVzaXplID0gcmVzaXplO1xud2luZG93Lm9ubG9hZCA9IGluaXQ7XG4iLCJ2YXIgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5vcHRpb25zXCIpXG52YXIgRG9tQW5nbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFuZ2xlXCIpO1xudmFyIERvbUxlbmd0aCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubGVuZ3RoXCIpO1xuICAgIFxuRG9tQW5nbGUudHlwZSA9IFwicmFuZ2VcIjtcbi8vIHRoaXMuYW5nbGUuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cbkRvbUFuZ2xlLm1pbiA9IC1NYXRoLlBJO1xuRG9tQW5nbGUubWF4ID0gTWF0aC5QSTtcbkRvbUFuZ2xlLnN0ZXAgPSAwLjAwMTtcbkRvbUFuZ2xlLnZhbHVlID0gTWF0aC5QSSAvNTtcblxuRG9tTGVuZ3RoLnR5cGUgPSBcInJhbmdlXCI7XG4vLyB0aGlzLmxlbmd0aC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblxuXG5Eb21MZW5ndGgubWluID0gMC4wO1xuRG9tTGVuZ3RoLm1heCA9IDEwO1xuRG9tTGVuZ3RoLnN0ZXAgPSAwLjAwMTtcblxuXG5mdW5jdGlvbiBQYXJhbWV0ZXIgKG5hbWUsZG9tRWwpe1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5kb21FbGVtZW50ID0gZG9tRWw7XG4gICAgdGhpcy52YWx1ZSA9IHBhcnNlRmxvYXQoZG9tRWwudmFsdWUpO1xufVxuXG5cbmZ1bmN0aW9uIFVpKCl7XG4gICAgXG4gICAgLy9tYiBkbyBzb21ldGhpbmcgbGlrZSBwYXJhbWV0ZXJzW2RvbWVsXSA9IHZhbDsgXG4gICAgdGhpcy5wYXJhbWV0ZXJzID0gW107XG4gICAgdGhpcy5wYXJhbWV0ZXJzW1wiYW5nbGVcIl0gPSBuZXcgUGFyYW1ldGVyKFwiYW5nbGVcIixEb21BbmdsZSk7XG4gICAgdGhpcy5wYXJhbWV0ZXJzW1wibGluZUxlbmd0aFwiXSA9IG5ldyBQYXJhbWV0ZXIoXCJsaW5lTGVuZ3RoXCIsRG9tTGVuZ3RoKTtcbiAgICBcbiAgICBmb3IodmFyIHBhcmFtIGluIHRoaXMucGFyYW1ldGVycylcbiAgICAgICAgeyAgICAgICAgXG4gICAgICAgICAgICAoZnVuY3Rpb24ocGFyYW0pe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnNbcGFyYW1dLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMub25WYWx1ZUNoYW5nZSh0aGlzLnBhcmFtZXRlcnNbcGFyYW1dKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpKHBhcmFtKVxuICAgICAgICB9XG5cbn1cblxuVWkucHJvdG90eXBlLm9uVmFsdWVDaGFuZ2UgPSBmdW5jdGlvbihwYXJhbSl7XG4gICAgXG4gICAgY29uc29sZS5sb2cocGFyYW0uZG9tRWxlbWVudC52YWx1ZSk7XG4gICAgXG4gICAgcGFyYW0udmFsdWUgPSBwYXJzZUZsb2F0KHBhcmFtLmRvbUVsZW1lbnQudmFsdWUpO1xufVxuXG5VaS5wcm90b3R5cGUuZ2V0UGFyYW0gPSBmdW5jdGlvbihuYW1lKXtcbiAgICAgcmV0dXJuIHRoaXMucGFyYW1ldGVyc1tuYW1lXS52YWx1ZTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9ICBVaTsiXX0=
