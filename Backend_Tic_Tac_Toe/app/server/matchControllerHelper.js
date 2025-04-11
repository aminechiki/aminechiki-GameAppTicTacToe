let dataAccesses = require('./matchDataAccesses')


function startMatch(req, res) {

    dataAccesses.startMatch((err, result) => {

        if (!err) {
            console.log()
            res.status(200).send(result);
        }
        else {
            console.log(err)
            res.status(500).send({
                "error": "Partita non creata",
                "message": err
              })
        }
    })
}


function getMatch(req, res) {

    let { match_code } = req.params;

    dataAccesses.getMatch(match_code, (err, result) => {

        if (!err) {

            if (result != undefined) {
                res.status(200).send(result);
            }
            else {
                res.status(404).send({
                    "error": "Partita non trovata",
                    "message": `Non esiste alcuna partita con il codice: ${match_code}`
                  });
            }
        }
        else {
            res.status(500).send(err);
        }
    })
}


function getListMatchs(req, res) {

    dataAccesses.getListMatchs((err, result) => {

        if (!err) {
            res.status(200).send(result)
        }
        else {
            res.status(500).send({
                "error": "Errore durante il recupero dei dati",
                "message": err
              })
        }
    })
}


function insertMove(req, res) {

    let move = req.body;

    dataAccesses.insertMove(move, (err, result) => {

        if (!err) {
            res.status(200).send(result)
        }
        else {
            res.status(500).send({
                "error": "Errore durante l'inseriemnto della mossa",
                "message": err
              })
        }
    })
}


function addRemoteUser(req, res) {

    let stateMatch = req.body;

    //torna il numero di record che ha modificato cioe 1 se tutto ok
    dataAccesses.addRemoteUser(stateMatch, (err, result) => {

        if (!err) {

            if(result == 1){
                res.status(200).send({ "rowUpdate" : result })
            }else{
                res.status(404).send(result)
            }
        }
        else {
            res.status(500).send({
                "error": `Errore durante la modifica del record con match_code = ${stateMatch.match_code}`,
                "message": err
              })
        }
    })
}


module.exports =
{
    getListMatchs,
    startMatch,
    getMatch,
    addRemoteUser,
    insertMove
}