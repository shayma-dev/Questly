import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Import App

// Import Mantine styles
import '@mantine/core/styles.css'; 
import 'highlight.js/styles/github.css';
import { createTheme, MantineProvider } from '@mantine/core';

// Create a theme for Mantine components (customize as needed)
const theme = createTheme({
  // Add custom theme settings here, if required
});

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme}>
          <App /> 
    </MantineProvider>
  </StrictMode>,
);