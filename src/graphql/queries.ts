import { gql } from '@apollo/client';

// ============================================
// QUERIES DE LIBROS
// ============================================

export const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    searchBooks(query: $query) {
      id
      title
      authors
      description
      thumbnail
      categories
      publisher
      published_date
    }
  }
`;

export const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      authors
      description
      thumbnail
      categories
      publisher
      published_date
    }
  }
`;

// ============================================
// QUERIES DE RESEÑAS
// ============================================

export const GET_REVIEWS_FOR_BOOK = gql`
  query GetReviewsForBook($bookId: String!) {
    reviewsForBook(bookId: $bookId) {
      id
      user_id
      google_book_id
      content
      rating
      karma_score
      created_at
      updated_at
      votes {
        voter_id
        value
      }
    }
  }
`;

export const GET_MY_REVIEWS = gql`
  query GetMyReviews {
    myReviews {
      id
      google_book_id
      content
      rating
      karma_score
      created_at
      updated_at
    }
  }
`;

// ============================================
// QUERIES DE USUARIOS
// ============================================

export const GET_ME = gql`
  query GetMe {
    me {
      user {
        id
        email
        first_name
        last_name
        has_selected_preferences
        preferred_genres
      }
      avatar
      bio
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: Int!) {
    userProfile(userId: $userId) {
      id
      first_name
      last_name
      date_joined
      profile {
        avatar
        bio
      }
    }
  }
`;

// ============================================
// QUERIES DE RECOMENDACIONES
// ============================================

export const GET_RECOMMENDATIONS = gql`
  query GetRecommendations($level: Int) {
    recommendations(level: $level) {
      bookId
      title
      authors
      categories
      avgRating
      nRatings
      reason
    }
  }
`;

export const GET_COLLABORATIVE_RECOMMENDATIONS = gql`
  query GetCollaborativeRecommendations {
    collaborativeRecommendations {
      bookId
      title
      authors
      recommended_by_user
      because_both_rated_high
      similar_user_rating
      reason
    }
  }
`;

export const GET_MY_RATINGS = gql`
  query GetMyRatings {
    myRatings {
      bookId
      title
      authors
      stars
      timestamp
    }
  }
`;

// ============================================
// QUERIES DE PRECIOS (WEB SCRAPING)
// ============================================

export const GET_BOOK_PRICES = gql`
  query GetBookPrices($bookTitle: String!) {
    getBookPrices(bookTitle: $bookTitle) {
      book_title
      prices {
        source
        price
      }
      status
      message
    }
  }
`;

export const GET_ALL_SCRAPED_BOOKS = gql`
  query GetAllScrapedBooks {
    getAllScrapedBooks {
      books {
        id
        title
        price
        source
        scraped_at
      }
      count
      timestamp
    }
  }
`;