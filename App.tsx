import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';

type View = 'LANDING' | 'DASHBOARD';

export default function App() {
  const [view, setView] = useState<View>('LANDING');

  return (
    <>
      {view === 'LANDING' ? (
        <LandingPage onEnter={() => setView('DASHBOARD')} />
      ) : (
        <Dashboard onLogout={() => setView('LANDING')} />
      )}
    </>
  );
}
