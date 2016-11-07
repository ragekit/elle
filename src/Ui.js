var container = document.querySelector(".options")
var DomAngle = document.querySelector(".angle");
var DomLength = document.querySelector(".length");

var DomMutate = document.querySelector(".mutate");
    
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


//static Dom :



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