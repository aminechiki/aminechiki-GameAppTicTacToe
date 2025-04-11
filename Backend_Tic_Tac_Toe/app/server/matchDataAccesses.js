const client = require('../db/connectiondata');
const { Server } = require('socket.io');
const crypto = require('crypto'); //per genrare codici lfa numerici random
const io = require('../../app').io;

// apre la connessione con il DB
client.connect()
  .then(() => console.log('Connessione al DB riuscita!'))
  .catch(err => console.error('Errore di connessione:', err));

// inializza la partita
async function startMatch(callback) {

    try {
        // genra il codice univoco che i giocatori possono passarsi
        const code = crypto.randomBytes(8).toString('hex').slice(0, 8).toUpperCase();
        console.log(code)
        let QueryString = `SELECT match_code('${code}')`;

        client.query(QueryString, (err, result) => {

            if (!err) {
                console.log(result.rows)
                return callback(null, result.rows);
            }else{
                console.log(err.message)
                return callback(err.message);
            }
        });

    } catch (err) {
        console.log(err);
        return callback(err);
    }
}

// torna la lista completa delle partite
async function getListMatchs(callback) {

    try {
        let QueryString = `select * from public.matchs
                           ORDER BY time_start_match desc`;

        client.query(QueryString, (err, result) => {

            if (!err) {
                console.log(result.rows)
                return callback(null, result.rows);
            }else{
                console.log(err.message)
                return callback(err.message);
            }
        });

    } catch (err) {
        console.log(err);
        return callback(err);
    }
}


// torna un singolo match filtrato per il match code
async function getMatch(match_code, callback) {

    try {
        let QueryString = `SELECT * FROM matchs WHERE match_code = '${match_code}';`

        client.query(QueryString, (err, result) => {

            if (!err) {
                console.log(result.rows[0])
                return callback(null, result.rows[0])
            }
            else {
                console.log(err.message)
                return callback(err);
            }
        })

    } catch (err) {

        console.log(err);
        return callback(err)
    }
}


// salva la vittoria
function saveWinner(matchCode, winner) {

    try {
        let QueryString = `UPDATE matchs 
                                    SET winner = ${winner}
                           WHERE match_code = '${matchCode}'`

        client.query(QueryString, (err, result) => {

            if (!err) {
                console.log("SALVATAGGIO VITTORIA")
            }
            else {
                console.log(err.message)
            }
        })

    } catch (err) {
        console.log(err);
    }
}


// inserisce una nuova mossa eseguita dall'utente
function insertMove(obj, callback) {

getMatch(obj.match_code, (err, matchData) => {

    try{

        if(matchData != null){

            console.log(`MATCH CODE '${obj.match_code}', GIOCATORE : ${obj.player}, CELLA: ${obj.cell});`)

            // posizioni i valori delle celle come nel gioco tris
            const cells = [
                matchData.cell_01, matchData.cell_02, matchData.cell_03,
                matchData.cell_11, matchData.cell_12, matchData.cell_13,
                matchData.cell_21, matchData.cell_22, matchData.cell_23
                ]
        
            // se il giocatore che ha fatto la mossa è uguale a quello che dovrebbe giocare (current_player)
           if(obj.player == matchData.current_player ){
        
            // se la cella dove si vuole fare la mossa è libera 
            if(cells[obj.cell - 1] == 0) {
        
                console.log("cella libera")
        
                try {
                    let QueryString = `SELECT * FROM insert_move('${obj.match_code}', ${obj.player}, ${obj.cell});`
                
                    client.query(QueryString, (err, result) => {
            
                        if (!err) {
                            
                            let winner = 0;
            
                            // prende le celle dal risultato della quesry
                            const cells = [
                                result.rows[0].cell_01, result.rows[0].cell_02, result.rows[0].cell_03,
                                result.rows[0].cell_11, result.rows[0].cell_12, result.rows[0].cell_13,
                                result.rows[0].cell_21, result.rows[0].cell_22, result.rows[0].cell_23
                              ];
                            
                              // ricrea le possibili vittorie trmite righe colonne e traversi
                              const victoryCombinations = [
            
                                [0, 1, 2],    // cell_01 - cell_01 - cell_03  -- RIGHE
                                [3, 4, 5],    // cell_11 - cell_12 - cell_13
                                [6, 7, 8],    // cell_21 - cell_22 - cell_23
            
                                [0, 3, 6],    // cell_01 - cell_11 - cell_21   -- COLONNE
                                [1, 4, 7],    // cell_02 - cell_12 - cell_13
                                [2, 5, 8],    // cell_03 - cell_13 - cell_23
            
                                [0, 4, 8],    // cell_01 - cell_12 - cell_23   -- TRAVERSI
                                [2, 4, 6],    // cell_03 - cell_12 - cell_21
                              ];
                                      
                              // cicla le combinazioni e fa un match con i dati della partita rpesi dal Db
                              for (let filacombinazioni of victoryCombinations) {
                                const [a, b, c] = filacombinazioni;
            
                                // verifica le combijazioni una alla volta
                                if (
                                    cells[a] !== 0             //se la prima cella è diversa da zero
                                    && cells[a] === cells[b]   //se la prima cella è uguale alla seconda cella
                                    && cells[a] === cells[c]   //se la seconda cella è uguale alla terza
                                   ) {
                                    // se una delle possibili combinazioni di vittoria viene soddisfatta allora setta come vincitore
                                    winner = 1;
                                }
                              }
            
                              // invia al cliente il codice della partita in modo che possano due schermate aggiornarsi quando
                              // uno dei due giocatori da una mossa
                              if(result.rows[0].is_remote_match) io.emit('refreshData', result.rows[0].match_code);
            
                              //se uno dei due giocatori ha vinto ...
                              if(winner == 1){
            
                             //salva il vincitore sul database                
                             saveWinner(result.rows[0].match_code, winner);
            
                             //query con tutta la stuttura dati
                             getMatch(result.rows[0].match_code, (err, matchData) => {
                              
                                // Usa i dati della partita qui
                                return callback(null, matchData)           
                              });
            
                              }else{
                                // se non cì'e ancora un vicnitore torna subito il risutlato senza
                                // modificare e riprendere i dati
                                return callback(null, result.rows[0])
                              }                        
                        }
                        else {
                            console.log(err.message)
                            return callback(err);
                        }
                    })
                } catch (err) {
            
                    console.log(err);
                    return callback(err);
                }
        
            }else{
                console.log(`La cella ${obj.cell} nella posizione è gia occupata`);
                return callback(`La cella ${obj.cell} nella posizione è gia occupata`);
            }
        
           }else{
            console.log(`Non è il turno del giocatore ${obj.player}, match_code : ${obj.match_code}`);
            return callback(`Non è il turno del giocatore ${obj.player}, match_code : ${obj.match_code}`);
           }

        }else{
            console.log(`Non è stata trovata nessuna partita con questo match_code ${obj.match_code}`);
            return callback(`Non è stata trovata nessuna partita con questo match_code ${obj.match_code}`);
        }



    }catch(err){

        console.log(err.message)
        return callback(err.message);
    }               

  });
}


// abbilita la partita come remota ---> is_remote_mnatch = true
async function addRemoteUser(obj, callback) {

    try {
        console.log(obj)
        let QueryString = `UPDATE public.matchs
                                 SET is_remote_match = ${obj.is_remote_match}
                           WHERE match_code = '${obj.match_code}'`

        client.query(QueryString, (err, result) => {

            if (!err) {
                return callback(null, result.rowCount)
            }
            else {
                console.log(err.message)
                return callback(err.message);
            }
        })
    } catch (err) {

        console.log(err.message);
        return callback(err.message)
    }
}

module.exports =
{
    getListMatchs,
    startMatch,
    getMatch,
    addRemoteUser,
    insertMove
}