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
    
    //mb do something like parameters[domel] = val; 
    this.parameters = [];
    this.parameters["angle"] = new Parameter("angle",DomAngle);
    this.parameters["lineLength"] = new Parameter("lineLength",DomLength);
    this.owner = owner;
    
    this.listeners = []
    
     for(var param in this.parameters)
    {   
       this.listeners[param] = this.onValueChange.bind(this,this.parameters[param]);
    }
    this.onMutateClick = this.onMutateClick.bind(this);

    
    
}





Ui.prototype.bindListener = function(){
    for(var param in this.parameters)
        {   
            this.parameters[param].domElement.value = this.parameters[param].value;
            this.parameters[param].domElement.addEventListener("input",this.listeners[param]);  
        }
    
    DomMutate.addEventListener("click",this.onMutateClick);
}

Ui.prototype.onMutateClick = function(){
    this.owner.mutateFromThis();
    
}

Ui.prototype.unbindListener = function(){
     for(var param in this.parameters)
        {        
            this.parameters[param].domElement.removeEventListener("input",this.listeners[param]);
        }
    
    DomMutate.removeEventListener("click",this.onMutateClick);
}


Ui.prototype.onValueChange = function(param){
    param.value = parseFloat(param.domElement.value);
}.bind(this)

Ui.prototype.getParam = function(name){
     return this.parameters[name].value;
}


module.exports =  Ui;