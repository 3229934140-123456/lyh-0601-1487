import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DemandPublish from "@/pages/DemandPublish";
import Showcase from "@/pages/Showcase";
import Matching from "@/pages/Matching";
import Communication from "@/pages/Communication";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="demands" element={<DemandPublish />} />
          <Route path="showcase" element={<Showcase />} />
          <Route path="matching" element={<Matching />} />
          <Route path="communication" element={<Communication />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
