String.prototype.setCharAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
}

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
    
    
    this.currentDrawIndex = 0;
    
    this.drawingFunctions = {
        "F" : () => {
            
            this.ctx.strokeStyle = "rgba(0,0,0,.3)";
            
            //this.ctx.beginPath();
            this.ctx.moveTo(this.position.x,this.position.y);
            this.position.x = this.position.x + Math.cos(this.direction) *2;
            this.position.y = this.position.y + Math.sin(this.direction) *2;
            
            this.ctx.lineTo(this.position.x,this.position.y);
            //this.ctx.stroke()
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
Drawer.prototype.reset = function(){
    this.done = false;
    this.currentDrawIndex = 0;
    
    this.direction = this.startArgument.dir;
    this.position.x = this.startArgument.pos.x;
    this.position.y = this.startArgument.pos.y;
    
}
Drawer.prototype.draw = function(nb){
    
    var nbOfDrawActions = 0;
    
    for (var i = this.currentDrawIndex; i < this.l.output.length; i++) {
        
        if(this.drawingFunctions[this.l.output[i]] == undefined) continue;
        
        
        
        this.drawingFunctions[this.l.output[i]].call(this);
        nbOfDrawActions ++;
        
        if(nbOfDrawActions >= nb)
        {
            this.currentDrawIndex = i+1;
            return;
        }
    }
    this.done = true;
}


var elle = new l();
elle.addVariables("XF");
elle.addconstants("+-[]");
elle.axiom = "X";
elle.addRule("X","F-[[X]+X]+F[+FX]-X");
elle.addRule("F","FF");
//elle.generate(6);



var div = document.createElement("div");
    div.style.position = "static";
    div.style.width = window.innerWidth + "px";
    div.style.height = window.innerHeight + "px";
    div.style.overflow = "hidden";
   


function scene(x,y,width,height){
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
}

var drawerList = []

var canvasList = []

for (var i = 0; i < 9; i++) {
    var canvas = document.createElement("canvas");
    div.appendChild(canvas);
    canvasList.push(canvas);
    canvas.width = window.innerWidth/3;
    canvas.height = window.innerHeight/3;
    var ctx = canvas.getContext("2d");
    document.body.appendChild(div);
    
    var clone = elle.clone();
    clone.mutate();
    clone.generate(6);
    
    var drawer = new Drawer(clone,ctx,{x:canvas.width/2,y:canvas.height/2},Math.PI/5,0);
    drawerList.push(drawer);
}


function clickCanvas(index){
    
    console.log(drawerList[index].l.rules["X"]);
    var newL = drawerList[index].l.clone();
    for (var i = 0; i < drawerList.length; i++) {
         var changedL = newL.clone();
         changedL.mutate();
         drawerList[i].l = changedL;
         drawerList[i].reset();
         changedL.generate(6);
         
         
         canvasList[i].width = canvasList[i].width;
    }
    
}

for (var i = 0; i < canvasList.length; i++) {
    canvasList[i].onclick = (function(i){
        return function(){clickCanvas(i)};
    })(i)
}


document.body.style.margin = 0;
(function loop(time){
    
    for (var i = 0; i < drawerList.length; i++) {
        if(!drawerList[i].done)
        {
           drawerList[i].ctx.beginPath();
           drawerList[i].draw(10);
           drawerList[i].ctx.stroke();
        }
    }
    requestAnimationFrame(loop);
})();

