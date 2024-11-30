import "./assets/App.css";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
