import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_RECOMMENDATIONS, 
  GET_COLLABORATIVE_RECOMMENDATIONS 
} from '../graphql/queries';
import { 
  SAVE_GENRES, 
  SEARCH_BOOK, 
  RATE_BOOK,
  CONFIRM_PREFERENCES 
} from '../graphql/mutations';

export const useRecommendations = (level?: number) => {
  // Queries
  const { 
    data: recommendationsData, 
    loading: recommendationsLoading,
    refetch: refetchRecommendations
  } = useQuery(GET_RECOMMENDATIONS, {
    variables: level ? { level } : {},
    skip: false
  });

  const { 
    data: collaborativeData, 
    loading: collaborativeLoading 
  } = useQuery(GET_COLLABORATIVE_RECOMMENDATIONS);

  // Mutations
  const [saveGenresMutation] = useMutation(SAVE_GENRES);
  const [searchBookMutation] = useMutation(SEARCH_BOOK);
  const [rateBookMutation] = useMutation(RATE_BOOK);
  const [confirmPreferencesMutation] = useMutation(CONFIRM_PREFERENCES);

  const saveGenres = async (genres: string[]) => {
    try {
      const { data } = await saveGenresMutation({
        variables: { genres }
      });
      return data?.saveGenres;
    } catch (error) {
      console.error('Error guardando géneros:', error);
      throw error;
    }
  };

  const registerBookSearch = async (book: {
    bookId: string;
    title: string;
    authors?: string[];
    categories?: string[];
    publishedDate?: string;
    description?: string;
  }) => {
    try {
      await searchBookMutation({
        variables: book
      });
    } catch (error) {
      console.error('Error registrando búsqueda:', error);
    }
  };

  const rateBook = async (bookId: string, stars: number) => {
    try {
      const { data } = await rateBookMutation({
        variables: { bookId, stars }
      });
      return data?.rateBook;
    } catch (error) {
      console.error('Error calificando libro:', error);
      throw error;
    }
  };

  const confirmPreferences = async () => {
    try {
      const { data } = await confirmPreferencesMutation();
      return data?.confirmPreferences;
    } catch (error) {
      console.error('Error confirmando preferencias:', error);
      throw error;
    }
  };

  return {
    // Data
    recommendations: recommendationsData?.recommendations || [],
    collaborativeRecommendations: collaborativeData?.collaborativeRecommendations || [],
    
    // Loading states
    recommendationsLoading,
    collaborativeLoading,
    
    // Actions
    saveGenres,
    registerBookSearch,
    rateBook,
    confirmPreferences,
    refetchRecommendations
  };
};