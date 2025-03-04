<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Home from './Pages/Home';
import Offers from './Pages/Offers';
import Profile from './Pages/Profile';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUp';
import ForgotPassword from './Pages/ForgotPassword';
=======
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Profile from "./Pages/Profile";
import ForgotPassword from "./Pages/ForgotPassword";
import Home from "./Pages/Home";
import Offers from "./Pages/Offers";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Header from ".components/Header";
>>>>>>> 33649240064ab3e5b9b647468746dce77b7b4403

function App() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/Offers" element={<Offers/>}></Route>
        <Route path="/Profile" element={<Profile/>}></Route>
        <Route path="/SignIn" element={<SignIn/>}></Route>
        <Route path="/SignUp" element={<SignUp/>}></Route>
        <Route path="/ForgotPassword" element={<ForgotPassword/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
