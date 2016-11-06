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