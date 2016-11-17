var Util =  {
    setCharAt : function(string, index, character) {
	   return string.substr(0, index) + character + string.substr(index+character.length);
    }
}
module.exports = Util;