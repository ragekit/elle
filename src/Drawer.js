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
