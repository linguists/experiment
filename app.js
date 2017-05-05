// --- LOADING MODULES
var express = require('express'),
    body_parser = require('body-parser'),
    mongoose = require('mongoose');

var cool = require('cool-ascii-faces');

// --- INSTANTIATE THE APP
var app = express();


// --- MONGOOSE SETUP
//mongoose.connect(process.env.CONNECTION || 'mongodb://localhost/jspsych'); //to store data locally on mongodb
mongoose.connect(process.env.CONNECTION); 
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log('database opened');
});

var emptySchema = new mongoose.Schema({}, { strict: false });
var Entry = mongoose.model('Entry', emptySchema);

//var server = app.listen(3000, function(){
//    console.log("Listening on port %d", server.address().port);
//});

//app.set('port', (process.env.PORT) || 3000); // To run locally
app.set('port', (process.env.PORT)); // To run online

//var server = app.listen(app.get('port'),  '0.0.0.0', function() {
var server = app.listen(app.get('port'), function() {
  console.log('Node app.js is running on port', app.get('port'));
});


// --- STATIC MIDDLEWARE 
//app.use(express.static(__dirname + '/public'));
app.use('/jspsych-5.0.3', express.static(__dirname + "/jspsych-5.0.3"));
app.use('/css', express.static(__dirname + "/css"));
app.use('/img', express.static(__dirname + "/img"));
app.use('/sound', express.static(__dirname + "/sound"));

// --- BODY PARSING MIDDLEWARE
//app.use(body_parser.json()); // to support JSON-encoded bodies
app.use(body_parser.urlencoded({ extended: false }))

// parse application/json
app.use(body_parser.json());

// --- VIEW LOCATION, SET UP SERVING STATIC HTML
app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// --- ROUTING
app.get('/', function(request, response) {
    response.render('index.html');
});

app.get('/experiment', function(request, response) {
    //response.render('exp_orig.html');
    response.render('exp_random.html');
});

app.get('/finish', function(request, response) {
    response.render('finish.html');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

app.post('/experiment-data', function(request, response){
    console.log(request.body);
    var test1 = Entry.create({
        "data":  request.body
    });
    console.log(test1);
    response.end();
});
