import React, { useEffect, useState } from 'react';
import { useCsrfToken } from './CsrfTokenContext'; // Import the hook


const CompanyReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const defaultProfilePhotoUrls = [
        'https://lh3.googleusercontent.com/a/ACg8ocLIudbeWrIiWWZp7p9ibYtGWt7_t2sZhu3GhVETjeORZQ=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocKWoslacgKVxr6_0nu2yNq78qvJS_JmSt-o-sm0Poz1=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocIkg86HfAMs_wSjeyDfK_T6jI0hsOa7uwPSHrvQkzxz=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocJF-8tCmJylLukUi86imkat5gT8nG4xHJuweKX0g7-T6A=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocJrHYSdRq54r0T0kNF60xZGqm58qhXVIB3ogEUkGa_e=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocKWj653OujAca153BqwYSRX18G0URD-9DV89ZYyArIET1U=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocKqelNaTWLy28Vdol7ewcw8EYyT2muaWVSjckEAamoy=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocI-UUmoZ36qdH-xNh8xlrTXv3Jx6H7QGBwXeaIa8rjT=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocKPAe4Ik_kZrxRvPsJmKD3YthHHK8mHe2VDb10mPSKP=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocKZ2tCDEg6Ehy8TRlFwuuVvvdpdRnSFfeGYRNUTq1U=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocLu8PkNc-7f1HUTNd94JtS73eJhUka5AIZucTp3Hlbw=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocLfObJkOnSt9CV8D8v_u6kTqfhrE-yQPAYjosZdlzvZ=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocLUv0B3n3yJCFDAuL2h3UzH2kExs6WQRooe_A662cMB=s128-c0x00000000-cc-rp-mo-ba2',
        'https://lh3.googleusercontent.com/a/ACg8ocJicBeMj3c-YfZSzCYTrkKfT8Z3tXIMXSNKxGwU8qim=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocLKrlJ0NBUgNt_mA6fqHxuYrVbHfYy48bb-CaVg3YQC=s128-c0x00000000-cc-rp-mo-ba3',
        'https://lh3.googleusercontent.com/a/ACg8ocKww_NJw1NmlQPCb0AodayToyOTvLxgGtcfIOPuromk=s128-c0x00000000-cc-rp-mo',
        'https://lh3.googleusercontent.com/a/ACg8ocIFg5G-JO49VMdkvA4N5IwxQ9XKjHP3HHTytStrVCI=s128-c0x00000000-cc-rp-mo'
    
    ];
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(
            date
            );
            
            return formattedDate;
        };
        const { csrfToken, setCsrfToken } = useCsrfToken(); // Get the CSRF token and setter function from the context
    useEffect(() => {
        const cacheKey = 'cached_yelp_reviews';

        const getCachedReviews = () => {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { reviews, expiry } = JSON.parse(cachedData);
                if (expiry > Date.now()) {
                    return JSON.parse(reviews);
                } else {
                    localStorage.removeItem(cacheKey); // Remove expired cache
                }
            }
            return null;
        };
        const saveToCache = (data) => {
            const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // Cache for 7 days
            const cacheData = JSON.stringify(data);
            localStorage.setItem(cacheKey, cacheData);
        };

        const fetchReviews = () => {
          
            const url =
              process.env.NODE_ENV === 'production'
                ? 'https://ortho-associates-of-riverside-12d6d06d6fbb.herokuapp.com/api/v1/pull_yelp_cache'
                : 'http://localhost:3000/api/v1/pull_yelp_cache';
          
            // Include the CSRF token in the headers of your fetch request
            const headers = {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken,
            };
          
            fetch(url, { headers })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error('Failed to fetch reviews');
                }
              })
              .then((data) => {
                // Check if data.reviews is a string
                console.log('data', data);
                if (typeof data.reviews === 'string') {
                  // Parse the JSON string into an array
                  const reviewsArray = JSON.parse(data);
                    console.log('reviewsArray', reviewsArray);
                  // Set the CSRF token in the context (if needed)
                  console.log('data', data);
                  if (data.csrf_token) {
                    console.log('token present');
                    setCsrfToken(data.csrf_token);
                  }
          
                  // Filter reviews with the default profile photo URLs
                  const filteredReviews = reviewsArray.filter(
                    (item) =>
                      !defaultProfilePhotoUrls.includes(item.profile_photo_url)
                  );
          
                  // Shuffle the filteredReviews array
                  const shuffledReviews = shuffleArray(filteredReviews);
          
                  // Take the first three reviews
                  const randomReviews = shuffledReviews.slice(0, 3);
          
                  saveToCache(data);
                  setReviews(randomReviews);
                  setLoading(false);
                } else {
                  throw new Error('Data.reviews is not a string');
                }
              })
              .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
              });
          };
          
          
          
        
        // Function to shuffle an array using the Fisher-Yates algorithm
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        

        const cachedReviews = getCachedReviews();
        if (cachedReviews) {
            setReviews(cachedReviews);
            setLoading(false);
        } else {
            fetchReviews();
        }
    }, []);

    return (
        <div className='reviews-container'>
                {reviews.map((item, index) => {
                    return (
                        <div key={index} className='single-review-container'>
                            <div className='review-top-info'>
                                <div
                                    className='user-icon'
                                    style={{
                                        backgroundImage: `url(${item.profile_photo_url})`,
                                    }}>
                                    {!item.profile_photo_url && (
                                        <i className='fas fa-user-circle'></i>
                                    )}
                                </div>
                                <div className='review-name-container'>
                                    <div className='user-name'>
                                        {item.author_name}{' '}
                                        <i className='fab fa-yelp'></i>
                                    </div>
                                </div>
                            </div>
                            <div className='review-info'>
                                <i
                                    className='fa fa-quote-left'
                                    aria-hidden='true'></i>
                                <i
                                    className='fa fa-quote-right'
                                    aria-hidden='true'></i>
                                <p className='review-paragraph'>{item.text}</p>
                            </div>
                            <div className='google-link'>
                                <a href={item.author_url} target="_blank" rel="noopener noreferrer">
                                    <i style={{ color: 'white' }} className="fab fa-google fa-lg"></i>
                                </a>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default CompanyReviewsPage;
