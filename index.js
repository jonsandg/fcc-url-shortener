var config = require("./config");
var mongoose = require('mongoose');
var validUrl = require('valid-url');
var shortid = require('shortid');

var express = require('express');
var app = express();

app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));

mongoose.connect(config.db.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log('Succesfully connected to mongodb: ' + config.db.url);
});

var urlSchema = mongoose.Schema({
    url: String
    , short_url: {
        type: String
        , default: shortid.generate
    }
    , clicks: {
        type: Number
        , default: 0
    }
});

var shortUrl = mongoose.model('ShortUrl', urlSchema);
var baseUrl = process.env.BASE_URL || ('https://intense-retreat-50168.herokuapp.com/');

app.get('/', function (req, res) {
    res.render('index');
    res.end();
});

app.get('/new/*', function (req, res) {
    var url = req.url.replace('/new/', '');
    console.log("New URL: " + url);
    if (validUrl.isUri(url)) {
        var short = new shortUrl({
            url: url
        });
        short.save(function (err) {
            if (err) {
                res.json({
                    error: 'Something failed'
                });
                console.error(err);
            }
            else {
                res.json({
                    original_url: url
                    , short_url: baseUrl + short.short_url
                });
            }
        });
    }
    else {
        res.json({
            error: 'URL not valid'
        });
    }
});

app.get('/:url', function (req, res) {
    console.log("accessing " + req.params.url);
    shortUrl.findOneAndUpdate({
        short_url: req.params.url
    }, {
        $inc: {
            clicks: 1
        }
    }, function (err, doc) {
        if (!doc || err) {
            res.json({
                error: 'URL does not exist'
            });
        }
        else {
            res.redirect(doc.url);
        }
    });
});

app.listen(app.get('port'), function () {
    console.log('Server running on ' + app.get('port'));
})