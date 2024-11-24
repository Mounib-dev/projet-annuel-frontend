import "./assets/App.css";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import Home from "./components/Home";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
      </Routes>
    </>
  );
}

export default App;
