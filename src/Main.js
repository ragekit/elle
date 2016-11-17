var App = require("./App");


var app = new App();
window.onresize = app.resize.bind(app);
window.onload = app.init.bind(app);
