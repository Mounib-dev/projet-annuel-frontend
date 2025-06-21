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

import GoalManager from "./components/goal/GoalManager";

import { BalanceProvider } from "./context/BalanceContext";

function App() {
  return (
    <AuthProvider>
      <BalanceProvider>
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
              <Route path="/goal" element={<GoalManager />}></Route>
              <Route path="/ai-assistant" element={<ChatBot />} />
            </Route>
          </Routes>
        </Layout>
      </BalanceProvider>
    </AuthProvider>
  );
}

export default App;
