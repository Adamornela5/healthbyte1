import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Offers from './Pages/Offers';
import Profile from './Pages/Profile';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUp';
import ForgotPassword from './Pages/ForgotPassword';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/offers" element={<Offers />}></Route>
        <Route path = "/profile" element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />}/>
        </Route>
        <Route path="/sign-in" element={<SignIn />}></Route>
        <Route path="/sign-up" element={<SignUp />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
      </Routes>
    </Router>
    <ToastContainer 
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        />
      </>
  );
}

export default App;
