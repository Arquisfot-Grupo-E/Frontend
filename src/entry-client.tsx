// src/entry-client.tsx
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apolloClient';
import { AuthProvider } from './contexts/AuthContext';
import App from "./App";
import "./index.css";

const container = document.getElementById("app");

if (container) {
  hydrateRoot(
    container,
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
}