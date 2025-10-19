import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apolloClient';
import { AuthProvider } from './contexts/AuthContext';
import App from "./App";


/**
 * Renderiza la aplicación React en el servidor
 * @param url - La URL de la petición (ej: "/feed", "/profile")
 * @returns HTML como string
 */
export function render(url: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ApolloProvider>
      </StaticRouter>
    </StrictMode>
  );

  return { html };
}
