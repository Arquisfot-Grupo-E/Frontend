import { useMutation } from '@apollo/client/react';
import { LOGIN, REGISTER } from '../graphql/mutations';

export const useAuth = () => {
  const [loginMutation, { loading: loginLoading, error: loginError }] = useMutation(LOGIN);
  const [registerMutation, { loading: registerLoading, error: registerError }] = useMutation(REGISTER);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password }
      });
      
      if (data?.login) {
        localStorage.setItem('access_token', data.login.access);
        localStorage.setItem('refresh_token', data.login.refresh);
        return data.login;
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    description?: string
  ) => {
    try {
      const { data } = await registerMutation({
        variables: { email, password, firstName, lastName, description }
      });
      return data?.register;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
  };

  return {
    login,
    register,
    logout,
    isAuthenticated,
    loginLoading,
    loginError,
    registerLoading,
    registerError
  };
};