import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://01.kood.tech/api/graphql-engine/v1/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken'); // Отримуємо токен під ключем 'authToken'
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
