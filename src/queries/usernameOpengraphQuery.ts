export const usernameOpengraphQuery = `query UsernameOpengraphQuery($username: String!) {
   user: userByUsername(username: $username) {
     ... on ErrUserNotFound {
       __typename
     }
     ... on ErrInvalidInput {
       __typename
     }
     ... on GalleryUser {
       __typename
       username
       bio
       galleries {
         collections {
           hidden
           tokens {
             token {
               dbid
               definition {
                  media {
                           ... on ImageMedia {
                             __typename
                             previewURLs {
                               small
                               medium
                               large
                             }
                             fallbackMedia {
                               mediaURL
                             }
                           }
                           ... on VideoMedia {
                             __typename
                             previewURLs {
                               small
                               medium
                               large
                             }
                             fallbackMedia {
                               mediaURL
                             } 
                           }
                  }
               }
             }
           }
         }
       }
     }
   }
 }`;
