import axios from 'axios';

const BASE_URL = 'https://01.kood.tech/api';

const encodeBase64 = (str: string) => {
  return btoa(str);
};

export const authenticate = async (usernameOrEmail: string, password: string) => {
  const credentials = encodeBase64(`${usernameOrEmail}:${password}`);
  try {
    const response = await axios.post(`${BASE_URL}/auth/signin`, {}, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    const token = response.data;
    if (!token || token.split('.').length !== 3) {
      throw new Error('Invalid JWT token');
    }
    return token;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};
