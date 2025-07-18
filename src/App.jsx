import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import Logs from './screens/Logs';
import Sidebar from './components/Sidebar';

const App = () => (
  <Router>
    <div className="app-container">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </main>
    </div>
  </Router>
);

export default App;
