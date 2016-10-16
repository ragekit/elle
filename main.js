function l(){
    this.variables = [];
    this.constants = [];
    this.axiom;
    this.rules = [];
    
    this.output;
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

function Drawer(lSystem,context,startpos,angle,jitter = 0){
    this.l = lSystem;
    
    this.position = {x:startpos.x,y:startpos.y}
    this.direction = -Math.PI /2;
    this.savedPosition = [];
    this.angle = angle;
    this.ctx = context;
    this.jitter = jitter;
    
    this.drawingFunctions = {
        "F" : () => {
            
            this.ctx.strokeStyle = "rgba(0,0,0,.3)";
            this.ctx.beginPath();
            
            this.ctx.moveTo(this.position.x,this.position.y);
            this.position.x = this.position.x + Math.cos(this.direction) *1;
            this.position.y = this.position.y + Math.sin(this.direction) *1;
            
            this.ctx.lineTo(this.position.x,this.position.y);
            this.ctx.stroke()
        },
        "+" : () => {
            this.direction += this.angle + (Math.random()*2 -1)*this.jitter;

        },
        "-" : () => {
            this.direction -= this.angle + (Math.random()*2 -1)*this.jitter;
            },
        "[" : () => {
            this.savedPosition.push(
                {pos:{x:this.position.x,y:this.position.y},dir:this.direction});
                
        },
        "]" : () => {
            var saved = this.savedPosition.pop();
            
            if(saved != null){
                
                this.position = saved.pos;
                this.direction = saved.dir;
                
            }
        },
    }
}
Drawer.prototype.draw = function(){
    
    var index = 0;
    
    for (var i = 0; i < this.l.output.length; i++) {
        
        if(this.drawingFunctions[this.l.output[i]] == undefined) continue;
        
        setTimeout((function(i){
            
           return function(){
               //console.log(this.l.output[i]);
               this.drawingFunctions[this.l.output[i]].call(this);
               }.bind(this);
        }.bind(this))(i),index);
        index +=0.1;
    }
}



var elle = new l();
elle.addVariables("XF");
elle.addconstants("+-[]");
elle.axiom = "X";
elle.addRule("X","F-[[X]+X]+F[+FX]-X");
elle.addRule("F","FF");
elle.generate(6);


var canvases = [];

var div = document.createElement("div");

    div.style.position = "static";
    div.style.width = window.innerWidth + "px";
    div.style.height = window.innerHeight + "px";
    div.style.overflow = "hidden";
document.body.appendChild(div);
for (var i = 0; i < 9; i++) {
    
    
    canvases.push(document.createElement("canvas"));
    var canvas = canvases[i];
    
    
    canvas.width = window.innerWidth/3;
    canvas.height = window.innerHeight/3;
    div.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    var drawer = new Drawer(elle,ctx,{x:canvas.width/2,y:canvas.height -20},Math.PI/10,.2);
    drawer.draw();
}

document.body.style.margin = 0;


