import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({ cpu: '0%', memory: '0%', time: '' });

  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: replace with real diagnostics
      setStats({
        cpu: `${Math.floor(Math.random() * 100)}%`,
        memory: `${Math.floor(Math.random() * 100)}%`,
        time: new Date().toLocaleTimeString(),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div>CPU Usage: {stats.cpu}</div>
      <div>Memory Usage: {stats.memory}</div>
      <div>Current Time: {stats.time}</div>
    </div>
  );
};

export default Dashboard;
