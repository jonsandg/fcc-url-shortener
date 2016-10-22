var express = require('express');
var app = express();
var mongoose = require('mongoose');
var validUrl = require('valid-url');
var shortid = require('shortid');

var url = 'mongodb://localhost:27017/url_ms';


app.set('view engine', 'jade');

app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));

mongoose.connect(url);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Succesfully connected to mongodb: ' + url);
});

var urlSchema = mongoose.Schema({
    url : String,
    short_url : {type : String, default : shortid.generate},
    date : {type: Date, default : Date.now},
    clicks : {type : Number, default : 0}
});

var shortUrl = mongoose.model('ShortUrl', urlSchema);
var baseUrl = process.env.BASE_URL || ('http://localhost:' + app.get('port') + '/');


app.get('/', function(req, res){
    res.render('index');
});

app.get('/new/*', function(req, res){
    var url = req.url.replace('/new/', '');
    console.log("New URL: " + url);
    if(validUrl.isUri(url)){
        var short = new shortUrl({ url : url});
        short.save(function (err) {
            if (err) {
                res.json({error : 'Something failed'});
                console.error(err);
            } else {
                res.json({
                    original_url : url,
                    short_url : baseUrl + short.short_url
                });
            }
  
        });
    } else {
        res.json({error : 'URL not valid'});
    }
});

app.get('/*', function(req, res){
    shortUrl.findOneAndUpdate({short_url : req.url.substr(1)}, {$inc : {clicks : 1}}, function(err, doc){
        if (err) res.json({error : 'URL does not exists'});
        else {
            res.redirect(doc.url);
        }
    });
});

app.listen(app.get('port'), function(){
    console.log('Server running on ' + app.get('port'));

})