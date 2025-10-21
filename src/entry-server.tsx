// src/entry-server.tsx
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { StrictMode } from "react";
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apolloClient';
import { AuthProvider } from './contexts/AuthContext';
import App from "./App";

export function render(url: string) {
  const html = renderToString(
    <StrictMode>
      <MemoryRouter initialEntries={[url]}>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ApolloProvider>
      </MemoryRouter>
    </StrictMode>
  );
  return { html };
}