var mongoose = require('mongoose');  
var projectSchema = new mongoose.Schema({  
  naziv: String,
  opis: String,
  cijena: Number,
  clanovi: String,
  datumPocetka: { type: Date, default: Date.now },
  datumZavrsetka: { type: Date, default: Date.now },
  username: String,
  obavljeniPoslovi: Boolean,
  arhiva: Boolean
});
mongoose.model('Project', projectSchema);