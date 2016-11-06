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


//# sourceMappingURL=app.js.map
