import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';


function WinnerMatch(){

    const navigate = useNavigate();
      const { winner } = useParams();

    return (

    <div className="App">
      <header className="App-header">

      <div>
        <h1 style={{fontSize: '100px'}}>HA VINTO IL GIOCATORE {winner}</h1>
      <button style={{ marginRight: '80px' }} onClick={() => { navigate(`/`); }} type="button" className="btn btn-info" ><b>TORNA AL MENU INIZIALE</b></button>
      </div>
      </header>
    </div>

    );
}


export default WinnerMatch;