// src/services/profile.ts
import { authService, type User as UserType } from '../services/auth';
import { apolloClient } from '../lib/apolloClient';
import { GET_ME } from '../graphql/queries';
import { UPDATE_PROFILE } from '../graphql/mutations';



const API_BASE = 'http://localhost:8001';

export type ProfilePayload = {
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
};

export type ProfileResponse = {
  user: UserType & {
    has_selected_preferences?: boolean;
    preferred_genres?: unknown[];
    is_staff?: boolean;
  };
  avatar: string | null;
  bio: string;
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return (res.status === 204 ? (undefined as T) : await res.json()) as T;
}

// export const ProfileService = {
//   get: async (): Promise<ProfileResponse> => {
//     const res = await authService.authenticatedFetch(`${API_BASE}/api/accounts/profile/`);
//     return handle<ProfileResponse>(res);
//   },

//   // El backend pide PUT en /update/
//   update: async (payload: ProfilePayload): Promise<ProfileResponse> => {
//     const res = await authService.authenticatedFetch(
//       `${API_BASE}/api/accounts/profile/update/`,
//       {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       }
//     );
//     return handle<ProfileResponse>(res);
//   },
// };

export const ProfileService = {
  get: async (): Promise<ProfileResponse> => {
    const { data } = await apolloClient.query({
      query: GET_ME,
      fetchPolicy: 'network-only'
    });

    if (!data?.me) {
      throw new Error('No se pudo cargar el perfil');
    }

    return data.me;
  },

  update: async (payload: ProfilePayload): Promise<ProfileResponse> => {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PROFILE,
      variables: {
        firstName: payload.first_name,
        lastName: payload.last_name,
        bio: payload.bio
      }
    });

    return data?.updateProfile;
  }
};