import { BrowserRouter as Router, Routes, Route } from "react-router";
import Profile from "./Pages/Profile";
import ForgotPassword from "./Pages/ForgotPassword";
import Home from "./Pages/Home";
import Offers from "./Pages/Offers";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Header from ".components/Header";

function App() {
  return (
    <>
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/offers" element={<Offers />}></Route>
        <Route path="/sign-in" element={<SignIn />}></Route>
        <Route path="/sign-up" element={<SignUp />}></Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;
