import { LOGIN, REGISTER } from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";
import { apolloClient } from "../lib/apolloClient";

// Tipos para autenticación
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  description?: string;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  description?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

const API_BASE_URL = 'http://localhost:8001'; // Puerto del backend Django

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Cargar tokens desde localStorage al inicializar (solo en navegador)
    if (typeof window !== 'undefined') {
      this.loadTokensFromStorage();
    }
  }

  private loadTokensFromStorage() {
    if (typeof window === 'undefined') return; // Protección SSR
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
    //
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }

  // Registro de usuario
  // async register(userData: RegisterData): Promise<User> {
  //   const response = await fetch(`${API_BASE_URL}/api/accounts/register/`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(userData),
  //   });

  //   if (!response.ok) {
  //     const errorData = await response.json().catch(() => ({ detail: 'Error en el registro' }));
  //     throw new Error(errorData.detail || errorData.email?.[0] || 'Error en el registro');
  //   }

  //   return response.json();
  // }
  async register(userData: RegisterData): Promise<User> {
    const { data } = await apolloClient.mutate({
      mutation: REGISTER,
      variables: {
        email: userData.email,
        password: userData.password,
        firstName: userData.first_name,
        lastName: userData.last_name,
        description: userData.description || ''
      }
    });

    if (!data?.register) {
      throw new Error('Error en el registro');
    }

    return data.register;
  }

  // Login de usuario
  // async login(credentials: LoginCredentials): Promise<AuthResponse> {
  //   const response = await fetch(`${API_BASE_URL}/api/accounts/login/`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       email: credentials.email,
  //       password: credentials.password,
  //     }),
  //   });

  //   if (!response.ok) {
  //     const errorData = await response.json().catch(() => ({ detail: 'Error en el login' }));
  //     throw new Error(errorData.detail || 'Credenciales incorrectas');
  //   }

  //   const authResponse: AuthResponse = await response.json();

  //   // Guardar tokens
  //   this.saveTokensToStorage({
  //     access: authResponse.access,
  //     refresh: authResponse.refresh,
  //   });

  //   // Si la respuesta ya incluye información del usuario (o un wrapper), normalizar y devolverla
  //   try {
  //     const possibleUser = (authResponse as any).user ?? (authResponse as any).data ?? null;
  //     if (possibleUser) {
  //       // Guardar también en localStorage la estructura completa para consistencia
  //       localStorage.setItem('user_data', JSON.stringify(possibleUser));
  //       return { ...authResponse, user: possibleUser };
  //     }
  //   } catch (err) {
  //     // ignore
  //   }

  //   // Si no vino user en la respuesta, intentar obtenerlo desde el endpoint de perfil
  //   try {
  //     const user = await this.getCurrentUser();
  //     return { ...authResponse, user };
  //   } catch (err) {
  //     // Si falla obtener perfil, igual devolvemos tokens para que el frontend pueda continuar
  //     return authResponse;
  //   }
  // }
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN,
      variables: {
        email: credentials.email,
        password: credentials.password
      }
    });

    if (!data?.login) {
      throw new Error('Credenciales incorrectas');
    }

    // Guardar tokens
    this.saveTokensToStorage({
      access: data.login.access,
      refresh: data.login.refresh
    });

    // Obtener datos del usuario
    try {
      const user = await this.getCurrentUser();
      return { ...data.login, user };
    } catch (err) {
      return data.login;
    }
  }
  // Reset password - enviar email de recuperación
 async resetPassword(email: string): Promise<void> {
   const response = await fetch(`${API_BASE_URL}/api/accounts/password-reset/`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({ email }),
   });


   if (!response.ok) {
     const errorData = await response.json().catch(() => ({ detail: 'Error al enviar el email' }));
     throw new Error(errorData.detail || errorData.email?.[0] || 'Usuario no encontrado');
   }
 }


 // Confirm password reset - confirmar con token y nueva contraseña
 async confirmPasswordReset(uidb64: string, token: string, newPassword: string): Promise<void> {
   const response = await fetch(`${API_BASE_URL}/api/accounts/password-reset-confirm/`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       uidb64,
       token,
       new_password: newPassword
     }),
   });


   if (!response.ok) {
     const errorData = await response.json().catch(() => ({ detail: 'Error al restablecer la contraseña' }));
     throw new Error(errorData.detail || errorData.new_password?.[0] || 'Token inválido o contraseña débil');
   }
 }


  // Logout
  logout() {
    this.clearTokensFromStorage();
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // Obtener el token de acceso
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Refrescar token
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/accounts/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: this.refreshToken,
      }),
    });

    if (!response.ok) {
      this.clearTokensFromStorage();
      throw new Error('Session expired');
    }

    const { access } = await response.json();
    this.accessToken = access;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
    }

    return access;
  }

  // Hacer peticiones autenticadas
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let token = this.getAccessToken();

    if (!token) {
      throw new Error('No access token available');
    }

    // Hacer la petición inicial
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Si el token expiró, intentar refrescarlo
    if (response.status === 401) {
      try {
        token = await this.refreshAccessToken();
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        this.logout();
        throw new Error('Session expired');
      }
    }

    return response;
  }

  // Obtener perfil del usuario actual
  // async getCurrentUser(): Promise<User> {
  //   const response = await this.authenticatedFetch(`${API_BASE_URL}/api/accounts/profile/`);

  //   if (!response.ok) {
  //     throw new Error('Error obteniendo perfil de usuario');
  //   }

  //   const data = await response.json();
  //   // Guardar la respuesta cruda para depuración/UI (puede venir { user: {...}, ... })
  //   localStorage.setItem('user_data', JSON.stringify(data));

  //   // Normalizar: si el backend devuelve { user: {...} } devolver el inner user
  //   const normalized = (data && (data as any).user) ? (data as any).user : data;
  //   return normalized as User;
  // }

  async getCurrentUser(): Promise<User> {
    const { data } = await apolloClient.query({
      query: GET_ME,
      fetchPolicy: 'network-only'
    });

    if (!data?.me) {
      throw new Error('Error obteniendo perfil de usuario');
    }

    const userData = data.me.user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
    return userData;
  }

  // Obtener datos del usuario desde localStorage
  getCachedUser(): User | null {
    if (typeof window === 'undefined') return null; // Protección SSR
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}

// Crear instancia singleton
export const authService = new AuthService();

// Hook personalizado para usar en React
export const useAuth = () => {
  return {
    login: authService.login.bind(authService),
    register: authService.register.bind(authService),
     resetPassword: authService.resetPassword.bind(authService),
   confirmPasswordReset: authService.confirmPasswordReset.bind(authService),
    logout: authService.logout.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService),
    getCachedUser: authService.getCachedUser.bind(authService),
    // Helpers útiles para llamadas autenticadas
    getAccessToken: authService.getAccessToken.bind(authService),
    authenticatedFetch: authService.authenticatedFetch.bind(authService),
    refreshAccessToken: authService.refreshAccessToken.bind(authService),
  };
};