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
    console.log("true");
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
function L(){
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
    ret.variables = this.variables;
    ret.constants = this.constants;
    ret.rules = this.rules;
    ret.axiom = this.axiom;
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
},{}],4:[function(require,module,exports){
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

},{"./Drawer":1,"./L":2,"./Ui":3}]},{},[4]);
