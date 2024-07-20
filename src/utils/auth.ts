import axios from 'axios';

export const login = async (username: string, password: string) => {
  const response = await axios.post('https://((DOMAIN))/api/auth/signin', {
    auth: {
      username,
      password,
    },
  });
  return response.data.token;
};
