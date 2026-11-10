import React from 'react';
import { createRoot } from 'react-dom/client';
import './engine/fonts';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
