import React, { useCallback, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GamesPage from './features/games/GamesPage';
import { getGames } from './features/games/gameSlice';
import { useAppDispatch } from './store/store';
import NavBar from './components/NavBar';
import SingleGamePage from './features/games/SingleGamePage';
import CreateGamePage from './features/games/CreateGamePage';
import EditGamePage from './features/games/EditGamePage';
import { StudentPage } from './features/student';

function App() {

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<StudentPage />} />
        {/* <Route path="/" element={<GamesPage/>} />
        <Route path="/game/:id" element={<SingleGamePage/>} />
        <Route path="/editgame/:id" element={<EditGamePage/>} />
        <Route path="/creategame" element={<CreateGamePage/>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
