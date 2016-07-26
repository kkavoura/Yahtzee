var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
        name: String,
        score: Number
    });

playerSchema.methods.dudify = function() {
  // add some stuff to the users name
  this.name = this.name + '-dude'; 

  return this.name;
};

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;


