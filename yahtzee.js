var mongoose = require('mongoose'),
    express = require('express');

var handlebars = require('express-handlebars').create({
    // defaultLayout:'main',
    // helpers: {
    //     section: function(name, options){
    //         if(!this._sections) this._sections = {};
    //         this._sections[name] = options.fn(this);
    //         return null;
    //     }
    // }
});

var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

mongoose.connect('mongodb://yahtzee-test-user:yahtzee-test-password@ds011495.mlab.com:11495/yahtzee-test');

var Player = require('./models/player.js');

//-------------------------------------------------------------------

app.use(express.static(__dirname));
app.set('port', process.env.PORT || 3000);
app.use(require('body-parser').urlencoded({extended: true}));

app.use(function(req, res, next){
    console.log('processing request for "' + req.url + '" . . . .');
    next();
});

app.get('/', function(req, res){
    res.render('./layouts/main');
});

app.post('/', function(req, res){
    var playerInfo = new Player(req.body);
    console.log(playerInfo);
    playerInfo.save(function(err){
        if(err){
            throw err;
        }
        console.log('Player name and score saved successfully!');
    });
});

app.get('/highScores', function(req, res){
    var playerHighScores = Player.find({}).sort({score: -1}).exec(function(err, users){
        if(err){
            throw err;
        }
        // res.render('highScores', {users: users});
        res.json(users);
    });

});


var server = app.listen(app.get('port'), function(){
    console.log('Listening on port %d.', app.get('port'));
});












