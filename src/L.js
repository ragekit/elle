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