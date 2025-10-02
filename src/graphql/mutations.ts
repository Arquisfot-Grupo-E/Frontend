import { gql } from '@apollo/client';

// ============================================
// MUTATIONS DE AUTENTICACIÓN
// ============================================

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access
      refresh
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $description: String
  ) {
    register(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      description: $description
    ) {
      id
      email
      first_name
      last_name
      # has_selected_preferences
      # preferred_genres
    }
  }
`;

// ============================================
// MUTATIONS DE PERFIL
// ============================================

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $firstName: String
    $lastName: String
    $avatar: String
    $bio: String
  ) {
    updateProfile(
      firstName: $firstName
      lastName: $lastName
      avatar: $avatar
      bio: $bio
    ) {
      user {
        id
        first_name
        last_name
      }
      avatar
      bio
    }
  }
`;

// ============================================
// MUTATIONS DE RESEÑAS
// ============================================

export const CREATE_REVIEW = gql`
  mutation CreateReview(
    $googleBookId: String!
    $content: String!
    $rating: Int!
  ) {
    createReview(
      googleBookId: $googleBookId
      content: $content
      rating: $rating
    ) {
      id
      google_book_id
      content
      rating
      karma_score
      created_at
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $content: String, $rating: Int) {
    updateReview(id: $id, content: $content, rating: $rating) {
      id
      content
      rating
      updated_at
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id) {
      detail
    }
  }
`;

// ============================================
// MUTATIONS DE RECOMENDACIONES
// ============================================

export const SAVE_GENRES = gql`
  mutation SaveGenres($genres: [String!]!) {
    saveGenres(genres: $genres) {
      user_id
      saved_genres
    }
  }
`;

export const SEARCH_BOOK = gql`
  mutation SearchBook(
    $bookId: String!
    $title: String!
    $authors: [String!]
    $categories: [String!]
    $publishedDate: String
    $description: String
  ) {
    searchBook(
      bookId: $bookId
      title: $title
      authors: $authors
      categories: $categories
      publishedDate: $publishedDate
      description: $description
    ) {
      registered
    }
  }
`;

export const RATE_BOOK = gql`
  mutation RateBook($bookId: String!, $stars: Int!) {
    rateBook(bookId: $bookId, stars: $stars) {
      user_id
      bookId
      stars
      timestamp
      message
    }
  }
`;

export const CONFIRM_PREFERENCES = gql`
  mutation ConfirmPreferences {
    confirmPreferences {
      detail
    }
  }
`;
