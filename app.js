(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./Drawer":2,"./L":3}],2:[function(require,module,exports){
var Ui = require("./Ui");


var maxIteration = 5;

//keep ref of all drawers
Drawer.list = [];


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
    this.ui = new Ui(this);

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
    Drawer.list.push(this);
    this.bindListeners();
}

Drawer.prototype.bindListeners = function(){
    this.ctx.canvas.addEventListener("mousedown",this.onClick.bind(this));
    window.addEventListener("mousemove",this.onMouseMove.bind(this));
    window.addEventListener("mouseup",this.onMouseUp.bind(this));
}

Drawer.prototype.mutateFromThis = function (){
     for (var i = 0; i < Drawer.list.length; i++) {
         
        if(Drawer.list[i] == this) continue;
         
        var clone = this.l.clone();
        clone.mutate();
        clone.generate(maxIteration);


        Drawer.list[i].l = clone;

        Drawer.list[i].reset();
        Drawer.list[i].ctx.canvas.width = Drawer.list[i].ctx.canvas.width;
    }
}

Drawer.mutateFromModel = function(baseSystem)
{

    for (var i = 0; i < Drawer.list.length; i++) {
        var clone = baseSystem.clone();
        clone.mutate();
        clone.generate(maxIteration);


        Drawer.list[i].l = clone;


        Drawer.list[i].reset();
        Drawer.list[i].ctx.canvas.width = Drawer.list[i].ctx.canvas.width;
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
    
    for (var i = 0; i < Drawer.list.length; i++) {
        Drawer.list[i].ctx.canvas.classList.remove("selected");
       // console.log(drawerList[i].l.rules);
        Drawer.list[i].ui.unbindListener();
    }
    this.ctx.canvas.classList.add("selected");
    this.ui.bindListener();
    this.ui.showPlantInfos(this.l.rulesToString());
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

},{"./Ui":5}],3:[function(require,module,exports){
var Util = require("./Util");

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

L.prototype.rulesToString = function(){
    
    var r =  "";
    
    for(var i in this.rules){
        r += i + "<br/>";
        r += this.rules[i] +"<br/>";

    }
    
    return r;
}

L.prototype.mutate = function(){
    
    // var string = "";
    // for(var i in this.rules){
    //     string += i;
    //     string += ">" + this.rules[i] + "|";
    // }
    var string = this.rules["X"];

   var replacement = this.variables.concat(this.constants);
   
   
   this.rules["X"] = Util.setCharAt(string,Math.floor(Math.random()*string.length),replacement[Math.floor(Math.random()*replacement.length)]);

}

module.exports = L;
},{"./Util":6}],4:[function(require,module,exports){
var App = require("./App");


var app = new App();
window.onresize = app.resize.bind(app);
window.onload = app.init.bind(app);

},{"./App":1}],5:[function(require,module,exports){
var container = document.querySelector(".options")
var DomAngle = document.querySelector(".angle");
var DomLength = document.querySelector(".length");
var DomMutate = document.querySelector(".mutate");
    
DomAngle.type = "range";

DomAngle.min = -Math.PI;
DomAngle.max = Math.PI;
DomAngle.step = 0.001;
DomAngle.value = Math.PI /5;

DomLength.type = "range";


DomLength.min = 0.0;
DomLength.max = 10;
DomLength.step = 0.001;


var PlantInfos = document.querySelector(".plantInfos");


function Parameter (name,domEl){
    this.name = name;
    this.domElement = domEl;
    this.value = parseFloat(domEl.value);
}


function Ui(owner){
    
    this.owner = owner;
    
    this.parameters = [];
    var registerParam = function(name,dom){
        var param =new Parameter(name,dom);
         this.parameters[name] = param;
    }.bind(this);
    
       
    registerParam("angle",DomAngle);
    registerParam("lineLength",DomLength);
        
    this.onValueChange = this.onValueChange.bind(this);
    this.onMutateClick = this.onMutateClick.bind(this);
}

Ui.prototype.bindListener = function(){
    for(var param in this.parameters)
        {   
            this.parameters[param].domElement.value = this.parameters[param].value;
            this.parameters[param].domElement.addEventListener("input",this.onValueChange);  
        }
    
    DomMutate.addEventListener("click",this.onMutateClick);
}

Ui.prototype.onMutateClick = function(){
    this.owner.mutateFromThis();    
}

Ui.prototype.showPlantInfos = function(string){
    PlantInfos.innerHTML = string;
}

Ui.prototype.unbindListener = function(){
     for(var param in this.parameters)
        {        
            this.parameters[param].domElement.removeEventListener("input",this.onValueChange);
        }
    
    DomMutate.removeEventListener("click",this.onMutateClick);
}


Ui.prototype.onValueChange = function(e){
    var param;
    
    for(var p in this.parameters)
    {
        if(this.parameters[p].domElement == e.target)
            {
                param = this.parameters[p];
                break;
            }
    }
    
    param.value = parseFloat(e.target.value);
}

Ui.prototype.getParam = function(name){
    
    //console.log(this.parameters[name].value);
    
     return this.parameters[name].value;
}


module.exports =  Ui;
},{}],6:[function(require,module,exports){
var Util =  {
    setCharAt : function(string, index, character) {
	   return string.substr(0, index) + character + string.substr(index+character.length);
    }
}
module.exports = Util;
},{}]},{},[4])


//# sourceMappingURL=app.js.map
