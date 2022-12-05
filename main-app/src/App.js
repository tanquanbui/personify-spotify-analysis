import logo from './logo.svg';
import './App.css';
import React from 'react';
import Login from './Login';
import {token as accessToken} from './spotify-api'
import {QueryClient, QueryClientProvider} from 'react-query'
function App() {
  return (
    <div className="App">
      <Login></Login>
    </div>
  );
}

export default App;
