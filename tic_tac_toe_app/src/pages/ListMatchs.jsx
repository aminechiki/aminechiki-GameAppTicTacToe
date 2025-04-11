import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ListMatchs() {

  const navigate = useNavigate();
  const [matchData, setMatchData] = useState([]);

  useEffect(() => {

    fetch(`${process.env.REACT_APP_API_URL}/server/matchs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMatchData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  function addRemoteUser(match_code) {

    console.log(match_code);

    fetch(`${process.env.REACT_APP_API_URL}/server/match/${match_code}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          "match_code": match_code,
          "is_remote_match": true,
        }
      )
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);

        sessionStorage.setItem('player', 2)
        navigate(`/Match/${match_code}`);
      })
      .catch(error => { console.error(error); });
  }

  return (
    <header className="App-header">

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4">
        <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between">
          <button style={{ marginRight: '80px' }} onClick={() => { navigate(`/`); }} type="button" className="btn btn-info" ><b>TORNA AL MENU INIZIALE</b></button>
        </div>
      </nav>

      <table className="table">
        <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <tr>
            <th scope="col">CODICE PARTITA</th>
            <th scope="col">INIZIO</th>
            <th scope="col">STATO PARTITA</th>
          </tr>
        </thead>
        <tbody>

          {matchData.map((match, index) => (
            <tr key={index} className="table-info">
              <td>{match.match_code}</td>
              <td>{new Date(match.time_start_match).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
              {match.move_count > 1 ? (
                <td>PARTITA CON GIÀ DUE GIOCATORI !!!!</td>
              ) : (
                <td><button onClick={() => addRemoteUser(match.match_code)} type="button" className="btn btn-secondary"><b>UNISCITI AD UNA PARTITA</b></button></td>
              )}
            </tr>
          ))}

        </tbody>
      </table>
    </header>
  );
}

export default ListMatchs;