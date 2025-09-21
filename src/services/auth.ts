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
    // Cargar tokens desde localStorage al inicializar
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // Registro de usuario
  async register(userData: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/accounts/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Error en el registro' }));
      throw new Error(errorData.detail || errorData.email?.[0] || 'Error en el registro');
    }

    return response.json();
  }

  // Login de usuario
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/accounts/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Error en el login' }));
      throw new Error(errorData.detail || 'Credenciales incorrectas');
    }

    const authResponse: AuthResponse = await response.json();
    
    // Guardar tokens
    this.saveTokensToStorage({
      access: authResponse.access,
      refresh: authResponse.refresh,
    });

    return authResponse;
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
    localStorage.setItem('access_token', access);

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
  async getCurrentUser(): Promise<User> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/accounts/profile/`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo perfil de usuario');
    }

    const user = await response.json();
    localStorage.setItem('user_data', JSON.stringify(user));
    return user;
  }

  // Obtener datos del usuario desde localStorage
  getCachedUser(): User | null {
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
    logout: authService.logout.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService),
    getCachedUser: authService.getCachedUser.bind(authService),
  };
};