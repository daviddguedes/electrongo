import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './pages/HomePage';

const App = () => (
    <HomePage />
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
