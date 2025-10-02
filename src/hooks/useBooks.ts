import { useQuery, useLazyQuery } from '@apollo/client';
import { SEARCH_BOOKS, GET_BOOK } from '../graphql/queries';

export const useBooks = () => {
  const [searchBooks, { 
    loading: searchLoading, 
    error: searchError, 
    data: searchData 
  }] = useLazyQuery(SEARCH_BOOKS);

  const [getBook, { 
    loading: bookLoading, 
    error: bookError, 
    data: bookData 
  }] = useLazyQuery(GET_BOOK);

  const search = async (query: string) => {
    try {
      const { data } = await searchBooks({ variables: { query } });
      return data?.searchBooks || [];
    } catch (error) {
      console.error('Error buscando libros:', error);
      return [];
    }
  };

  const getBookById = async (id: string) => {
    try {
      const { data } = await getBook({ variables: { id } });
      return data?.book;
    } catch (error) {
      console.error('Error obteniendo libro:', error);
      return null;
    }
  };

  return {
    search,
    getBookById,
    searchLoading,
    searchError,
    searchData,
    bookLoading,
    bookError,
    bookData
  };
};