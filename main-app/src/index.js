import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Pages/Login';
import Layout from './Pages/Layout';
import TopArtists from './Pages/TopArtists/TopArtists';
import TopTracks from './Pages/TopTracks/TopTracks';
import NoPage from './Pages/NoPage';

import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="topartists" element={<TopArtists />} />
          <Route path="toptracks" element={< TopTracks/>} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
