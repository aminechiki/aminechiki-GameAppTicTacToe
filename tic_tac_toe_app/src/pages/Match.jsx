import React, { useState, useEffect, useRef  } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Match.css';

function Match() {

  const navigate = useNavigate();
  const { match_code } = useParams();
  let [matchData, setMatchData] = useState(null);
  const [player, setPlayer] = useState(sessionStorage.getItem('player'));

  useEffect(() => {

    const socket = io(`${process.env.REACT_APP_API_URL}`);

    socket.on('refreshData', (message) => {

      if (message == match_code){

        getMatchData(match_code)
      }
    });

    //Invia un messaggio al server
    //socket.emit('refreshData', 'Ciao dal client!');

    getMatchData(match_code)
    
    return () => socket.disconnect();

  }, []);

  function insertMove(cell, current_player) {

    // se la partita non è in modalità remota 
    // o il giocatore settato nel local storage è uguale al giocatore corrente
    // e non c'è ancora un vincitore
    // allora puoi fare la mossa

    // player = al giocatore settato nel local storage --
    // ATTENZIONE !!!!! player viene settato da chi inizia la partita e 2 da ch si integra 
    //                  quindi non hanno a che fare no con l'altro serve pr la gestione remota degli utenti

    // current_player = giocatore che deve fare la mossa in quel momento --> viene rpeso dal databaase

    if ((matchData?.is_remote_match == false || player == current_player) && (matchData?.winner === null)) {

      fetch(`${process.env.REACT_APP_API_URL}/server/match`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {
            "match_code": match_code,
            "player": current_player,
            "cell": cell
          }
        )
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setMatchData(data);
        })
        .catch(error => { console.error(error); });
    }
  }
  

  function getMatchData(match_code){

    fetch(`${process.env.REACT_APP_API_URL}/server/match/${match_code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {

        setMatchData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }


  return (

    <div className="App">
      <header className="App-header">

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4">
          <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between">
           
            {matchData?.winner != null && (
             navigate(`/WinnerMatch/${matchData?.winner}`)
            )}

            {matchData?.winner === 1 && (
            <button style={{ marginRight: '80px' }} onClick={() => { navigate(`/`); }} type="button" className="btn btn-info" ><b>TORNA AL MENU INIZIALE</b></button>
            )}
            
            <h5>CODICE PARTITA : {match_code} </h5>

            {matchData?.is_remote_match === true && (
              <h5>SEI IL GIOCATORE : {player}</h5>
            )}

            {matchData?.winner === null ? (
              <h5>{matchData?.current_player === 1 ? 'TURNO DEL GIOCATORE 1 CON SEGNO X' : matchData?.current_player === 2 ? 'TURNO DEL GIOCATORE 2 CON SEGNO O' : ''} </h5>
            ) : (
              
              <h5>{matchData?.winner === 1 ? 'GIOCATORE 1 VINCITORE' : matchData?.winner === 2 ? 'GIOCATORE 2 VINCITORE' : matchData?.winner === null ? 'PARTITA IN CORSO' : 'PARTITA IN CORSO'} </h5>
            )}

            {matchData?.move_count > 1 && (

              <h5>{matchData?.is_remote_match === false ? 'MODALITA DI GIOCO : LOCALE' : matchData?.is_remote_match === true ? 'MODALITA DI GIOCO : REMOTA' : matchData?.is_remote_match === null ? 'LOCALE' : 'LOCALE'} </h5>
            )}
          </div>
        </nav>

        <div>
          <div>
            <button onClick={() => insertMove(1, matchData?.current_player)} id="cell_01" className="btn btn-secondary" > {matchData?.cell_01 === 1 ? 'X' : matchData?.cell_01 === 2 ? 'O' : ''} </button>
            <button onClick={() => insertMove(2, matchData?.current_player)} id="cell_02" className="btn btn-secondary" > {matchData?.cell_02 === 1 ? 'X' : matchData?.cell_02 === 2 ? 'O' : ''} </button>
            <button onClick={() => insertMove(3, matchData?.current_player)} id="cell_03" className="btn btn-secondary" > {matchData?.cell_03 === 1 ? 'X' : matchData?.cell_03 === 2 ? 'O' : ''} </button>
          </div>
          <div>
            <button onClick={() => insertMove(4, matchData?.current_player)} id="cell_11" className="btn btn-secondary" > {matchData?.cell_11 === 1 ? 'X' : matchData?.cell_11 === 2 ? 'O' : ''} </button>
            <button onClick={() => insertMove(5, matchData?.current_player)} id="cell_12" className="btn btn-secondary" > {matchData?.cell_12 === 1 ? 'X' : matchData?.cell_12 === 2 ? 'O' : ''} </button>
            <button onClick={() => insertMove(6, matchData?.current_player)} id="cell_13" className="btn btn-secondary" > {matchData?.cell_13 === 1 ? 'X' : matchData?.cell_13 === 2 ? 'O' : ''} </button>
          </div>
          <div>
            <button onClick={() => insertMove(7, matchData?.current_player)} id="cell_21" className="btn btn-secondary" > {matchData?.cell_21 === 1 ? 'X' : matchData?.cell_21 === 2 ? 'O' : ''} </button>
            <button onClick={() => insertMove(8, matchData?.current_player)} id="cell_22" className="btn btn-secondary" > {matchData?.cell_22 === 1 ? 'X' : matchData?.cell_22 === 2 ? 'O' : ''} </button>
            <button onClick={() => insertMove(9, matchData?.current_player)} id="cell_23" className="btn btn-secondary" > {matchData?.cell_23 === 1 ? 'X' : matchData?.cell_23 === 2 ? 'O' : ''} </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Match;