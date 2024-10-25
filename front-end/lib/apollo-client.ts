import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const uploadLink = createUploadLink({
  uri: 'http://localhost:8000/graphql',
});

const client = new ApolloClient({
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache()
});

export default client;