import logo from './logo.svg';
import './App.css';
import Header from "./components/Header"; // Import the Header component

function App() {
  return (
    <div className="App">
      {/* Add the Header component here */}
      <Header />

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Testing if this works <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
