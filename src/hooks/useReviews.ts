import { useQuery, useMutation } from '@apollo/client';
import { GET_REVIEWS_FOR_BOOK, GET_MY_REVIEWS } from '../graphql/queries';
import { CREATE_REVIEW, UPDATE_REVIEW, DELETE_REVIEW } from '../graphql/mutations';

export const useReviews = (bookId?: string) => {
  // Queries
  const { 
    data: reviewsData, 
    loading: reviewsLoading,
    refetch: refetchReviews
  } = useQuery(GET_REVIEWS_FOR_BOOK, {
    variables: { bookId: bookId || '' },
    skip: !bookId
  });

  const { 
    data: myReviewsData, 
    loading: myReviewsLoading,
    refetch: refetchMyReviews
  } = useQuery(GET_MY_REVIEWS);

  // Mutations
  const [createReviewMutation] = useMutation(CREATE_REVIEW);
  const [updateReviewMutation] = useMutation(UPDATE_REVIEW);
  const [deleteReviewMutation] = useMutation(DELETE_REVIEW);

  const createReview = async (googleBookId: string, content: string, rating: number) => {
    try {
      const { data } = await createReviewMutation({
        variables: { googleBookId, content, rating }
      });
      
      // Refrescar las reseñas después de crear
      await refetchReviews();
      await refetchMyReviews();
      
      return data?.createReview;
    } catch (error) {
      console.error('Error creando reseña:', error);
      throw error;
    }
  };

  const updateReview = async (id: string, content?: string, rating?: number) => {
    try {
      const { data } = await updateReviewMutation({
        variables: { id, content, rating }
      });
      
      await refetchReviews();
      await refetchMyReviews();
      
      return data?.updateReview;
    } catch (error) {
      console.error('Error actualizando reseña:', error);
      throw error;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteReviewMutation({
        variables: { id }
      });
      
      await refetchReviews();
      await refetchMyReviews();
    } catch (error) {
      console.error('Error eliminando reseña:', error);
      throw error;
    }
  };

  return {
    reviews: reviewsData?.reviewsForBook || [],
    myReviews: myReviewsData?.myReviews || [],
    reviewsLoading,
    myReviewsLoading,
    createReview,
    updateReview,
    deleteReview,
    refetchReviews,
    refetchMyReviews
  };
};