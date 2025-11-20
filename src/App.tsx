import { Routes, Route } from "react-router-dom";
import {
  AddExpensePage,
  Analysis,
  Daily,
  Home,
  ManageExpenses,
  Monthly,
  Settings,
} from "@/pages";
import { DashboardLayout } from "@/layout";

const App = () => (
  <DashboardLayout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add-expense" element={<AddExpensePage />} />
      <Route path="/daily" element={<Daily />} />
      <Route path="/monthly" element={<Monthly />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/manage-expenses" element={<ManageExpenses />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </DashboardLayout>
);

export default App;
