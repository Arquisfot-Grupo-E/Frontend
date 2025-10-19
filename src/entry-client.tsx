import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apolloClient';
import { AuthProvider } from './contexts/AuthContext';
import App from "./App";
import "./index.css";

// Hidratación: Convierte el HTML estático del servidor en app React interactiva
hydrateRoot(document.getElementById("root")!,
  <StrictMode>
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ApolloProvider>
    </BrowserRouter>
  </StrictMode>
);
