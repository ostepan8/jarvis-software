import React from 'react';

const Logs = () => {
  const dummyLogs = Array.from({ length: 50 }, (_, i) => `Log entry ${i + 1}`);

  return (
    <div>
      <h2>Logs</h2>
      <div className="log-feed">
        {dummyLogs.map((log) => (
          <div key={log}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default Logs;
