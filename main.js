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
            if( this.constants.indexOf(letter) > -1) continue; 
            letter = this.rules[letter];
            temp += letter;
        }
        
        this.output = temp;
        temp = "";
    }
}

l.prototype.addconstants = function(constants){
    for (var i = 0; i < arguments.length; i++) {
        this.constants.push(arguments[i]);
    }
}

l.prototype.addVariables = function(variables){
    for (var i = 0; i < arguments.length; i++) {
        this.variables.push(arguments[i]);
    }
}

l.prototype.addRule = function(from,to){
    this.rules[from] = to;
}

var elle = new l();
elle.addVariables("A","B");
elle.axiom = "A";
elle.addRule("A","AB");
elle.addRule("B","A[");
elle.addconstants("[");
elle.generate(3);

document.getElementById("output").innerHTML = elle.output;
