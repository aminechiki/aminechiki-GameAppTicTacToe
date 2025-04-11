import logo from './image.png';
import './App.css';
import { useNavigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Match from './pages/Match';
import ListMatchs from './pages/ListMatchs'
import WinnerMatch from './pages/WinnerMatch'

function Home() {
  const navigate = useNavigate();

  function startMatch() {

    fetch(`${process.env.REACT_APP_API_URL}/server/startMatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
      .then(response => response.json())
      .then(data => {
        console.log(data[0]);

        // chi inizia la partita ceiene settato come il giocatore 1
        sessionStorage.setItem('player', 1);

        // porta l'utente verso una nuova partita
        navigate(`/Match/${data[0].match_code}`);
      })
      .catch(error => { console.error(error); });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ fontSize: '100px' }}>Tic Tac Toe</h1>

        <div style={{ marginBottom: '80px' }}>
          <button style={{ marginRight: '80px' }} onClick={startMatch} type="button" className="btn btn-info" ><b>INIZIAMO UNA PARTITA</b></button>
          <button onClick={() => {navigate(`/ListMatchs`);}} type="button" className="btn btn-secondary"><b>UNISCITI AD UNA PARTITA</b></button>
        </div>
        <img src={logo} className="App-logo" width="300" height="300" alt="logo" />
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Match" element={<Match />} />
        <Route path="/Match/:match_code" element={<Match />} />
        <Route path="/ListMatchs" element={<ListMatchs />} />
        <Route path="/WinnerMatch/:winner" element={<WinnerMatch />} />
      </Routes>
    </Router>
  );
}

export default App;