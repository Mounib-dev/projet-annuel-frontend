import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./components/Dashboard";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

import Transaction from "./components/transaction/Transaction";

import DialogModal from "./components/utils/DialogModal";

import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";

import ChatBot from "./components/chatbot/ChatBot";
import FinanceChart from "./components/graph/FinancesChart";

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />}></Route>
            <Route path="/transaction" element={<Transaction />}></Route>
            <Route
              path="/test"
              element={<DialogModal isOpen={false} children={undefined} />}
            ></Route>
            <Route path="/graph" element={<FinanceChart />}></Route>
            <Route path="/ai-assistant" element={<ChatBot />} />
          </Route>
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
