String.prototype.setCharAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
}

function l(){
    this.variables = [];
    this.constants = [];
    this.axiom;
    this.rules = [];
    
    this.output = "";
}

l.prototype.generate = function(iterations){
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

l.prototype.addconstants = function(constants){
    for (var i = 0; i < constants.length; i++) {
        this.constants.push(constants[i]);
    }
}

l.prototype.addVariables = function(variables){
    for (var i = 0; i < variables.length; i++) {
        this.variables.push(variables[i]);
    }
}

l.prototype.addRule = function(from,to){
    this.rules[from] = to;
}

l.prototype.clone = function(){
    var ret = new l();
    ret.variables = this.variables;
    ret.constants = this.constants;
    ret.rules = this.rules;
    ret.axiom = this.axiom;
    return ret;
}

l.prototype.mutate = function(){
    
    // var string = "";
    // for(var i in this.rules){
    //     string += i;
    //     string += ">" + this.rules[i] + "|";
    // }
    var string = this.rules["X"];

   var replacement = this.variables.concat(this.constants);
   
   
   this.rules["X"] = string.setCharAt(Math.floor(Math.random()*string.length),replacement[Math.floor(Math.random()*replacement.length)]);

}

function Drawer(lSystem,context,startpos,angle,jitter = 0){
    this.l = lSystem;
    
    
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
    
    this.drawingFunctions = {
        "F" : () => {
            
            
            
            
            this.buffer.push({x:this.position.x,y:this.position.y});
            this.position.x = this.position.x + Math.cos(this.direction) *this.lineLength;
            this.position.y = this.position.y + Math.sin(this.direction) *this.lineLength;
            this.buffer.push({x:this.position.x,y:this.position.y});
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
Drawer.prototype.draw = function(nb){
   this.reset();
   
   
   
    if(this.l.output.length == 0) return;
    var nbOfDrawActions = 0;
    
    for (var i = 0; i < this.l.output.length; i++) {
        
        if(this.drawingFunctions[this.l.output[i]] == undefined) continue;
        
        
        
        this.drawingFunctions[this.l.output[i]].call(this);
        nbOfDrawActions ++;
        
        // if(nbOfDrawActions >= nb)
        // {
        //     this.currentDrawIndex = i+1;
        //     return;
        // }
    }
    //this.done = true;
}


var elle = new l();
elle.addVariables("XF");
elle.addconstants("+-[]");
elle.axiom = "X";
elle.addRule("X","F-[[X]+X]+F[+FX]-X");
elle.addRule("F","FF");
elle.generate(5);
var div;

function initDom(){
    div = document.createElement("div");
    div.style.position = "static";
    div.style.width = window.innerWidth + "px";
    div.style.height = window.innerHeight + "px";
    div.style.overflow = "hidden";
    document.body.style.margin = 0;
    document.body.appendChild(div);

}

initDom(); 

function resize(){
    div.style.width = window.innerWidth + "px";
    div.style.height = window.innerHeight + "px";
    
     for (var i = 0; i < drawerList.length; i++) {
     
         drawerList[i].ctx.canvas.width = window.innerWidth/3;
         drawerList[i].ctx.canvas.height = window.innerHeight/3;
     }
}


function scene(x,y,width,height){
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
}
var numberofDrawers = 9;
var drawerList = []

for (var i = 0; i < numberofDrawers; i++) {
    var canvas = document.createElement("canvas");
    div.appendChild(canvas);
    canvas.width = window.innerWidth/Math.sqrt(numberofDrawers);
    canvas.height = window.innerHeight/Math.sqrt(numberofDrawers);
    var ctx = canvas.getContext("2d");
    var drawer = new Drawer(elle,ctx,{x:canvas.width/2,y:canvas.height/2},Math.PI/5,0);
    drawerList.push(drawer);
 
}

function mutateFromModel(baseSystem)
{
    
    //console.log("///////");
    
    for (var i = 0; i < drawerList.length; i++) {
        var clone = baseSystem.clone();
        clone.mutate();
        clone.generate(5);
        
       // console.log(clone.rules["X"]);
        
        drawerList[i].l = clone;
        drawerList[i].reset();
        drawerList[i].ctx.canvas.width = drawerList[i].ctx.canvas.width;
    }
    
}

function clickCanvas(index){
    elle = drawerList[index].l.clone();
    mutateFromModel(elle);
}

for (var i = 0; i < document.querySelectorAll("canvas").length; i++) {
    document.querySelectorAll("canvas")[i].onclick = (function(i){
        return function(){clickCanvas(i)};
    })(i)
}

function ui(){
    this.angle = document.createElement("input");
    this.angle.type = "range";
    this.angle.style.position = "absolute";
    this.angle.style.top = "10px";
    this.angle.min = -Math.PI;
    this.angle.max = Math.PI;
    this.angle.step = 0.001;
    this.angle.value = Math.pi/8;
    
    
    this.length = document.createElement("input");
    this.length.type = "range";
    this.length.style.position = "absolute";
    this.length.style.top = "50px";
    
    this.length.min = 0.0;
    this.length.max = 10;
    this.length.step = 0.001;
    
    document.body.appendChild(this.angle);
    document.body.appendChild(this.length);
    
}

var u = new ui();



(function loop(time){
    var shittodrawlength = 0;
    for (var i = 0; i < drawerList.length; i++) {
        
        
        //update UI
         
        drawerList[i].angle = parseFloat(u.angle.value);
        drawerList[i].lineLength = parseFloat(u.length.value);
        
        //compute what to draw
        
        if(!drawerList[i].done)
        {
           
            drawerList[i].draw(10);
              
        }
        
        
        //draw shits
        drawerList[i].ctx.canvas.width =drawerList[i].ctx.canvas.width;
        drawerList[i].ctx.beginPath();
        drawerList[i].ctx.strokeStyle = "rgba(0,0,0,.2)";
        
        
        shittodrawlength += drawerList[i].buffer.length;
        
            for (var j = 0; j < drawerList[i].buffer.length; j+=2) {
               var pos = drawerList[i].buffer[j];
               drawerList[i].ctx.moveTo(pos.x,pos.y);
               pos = drawerList[i].buffer[j+1];
               drawerList[i].ctx.lineTo(pos.x,pos.y);
            }
               
        drawerList[i].ctx.stroke();
        
         
    }
    
    
  // console.log(shittodrawlength);
    
    requestAnimationFrame(loop);
})();




window.onresize = resize;

mutateFromModel(elle);