import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Login from './pages/Login';
import App from './pages/App';

function Root() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('lm_token'));

  const handleLogout = () => {
    localStorage.removeItem('lm_token');
    setAuthed(false);
  };

  return authed
    ? <App onLogout={handleLogout} />
    : <Login onLogin={() => setAuthed(true)} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
