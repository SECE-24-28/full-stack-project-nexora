"use client";

// 1. Import the core logic, including HttpLink
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// 2. Force the import of ApolloProvider explicitly
import { ApolloProvider } from "@apollo/client/react";

// Initialize Apollo Client with an explicit HttpLink
const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}