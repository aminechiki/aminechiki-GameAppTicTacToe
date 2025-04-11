let express = require('express');
let router = express.Router();            
let controllers = require('./matchControllerHelper')

//niente parametri

router.post('/startMatch', controllers.startMatch);              //Comincia una nuova partita
router.get('/match/:match_code', controllers.getMatch)           //Recupera i del singolo match
router.get('/matchs', controllers.getListMatchs);                //Recupera la lista intera delle partite
router.patch('/match', controllers.insertMove)                   //Modifica la struttura delle celle del tris
router.patch('/match/:match_code', controllers.addRemoteUser)    //Abilità la partita come remota


module.exports = router