import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./components/Home";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

import Transaction from "./components/transaction/Transaction";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Transaction" element={<Transaction />}></Route>
        </Routes>
      </Layout>
    </>
  );
}

export default App;
