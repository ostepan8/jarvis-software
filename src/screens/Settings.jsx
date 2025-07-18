import React, { useState } from 'react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  const handleToggle = () => {
    setDarkMode(!darkMode);
    // TODO: persist user preference
  };

  return (
    <div>
      <h2>Settings</h2>
      <label>
        <input type="checkbox" checked={darkMode} onChange={handleToggle} />
        Dark Mode
      </label>
    </div>
  );
};

export default Settings;
