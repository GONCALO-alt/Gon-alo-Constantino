import React from 'react';
import { createRoot } from 'react-dom/client';
import './engine/fonts';
import '@fontsource/inter/400-italic.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700-italic.css';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
