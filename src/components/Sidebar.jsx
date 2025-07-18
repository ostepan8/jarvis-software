import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => (
  <nav className="sidebar">
    <ul>
      <li><NavLink to="/dashboard">Dashboard</NavLink></li>
      <li><NavLink to="/settings">Settings</NavLink></li>
      <li><NavLink to="/logs">Logs</NavLink></li>
    </ul>
  </nav>
);

export default Sidebar;
