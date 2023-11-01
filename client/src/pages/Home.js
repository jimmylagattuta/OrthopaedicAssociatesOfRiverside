import React, { useState, useEffect, Suspense } from 'react';
import ExpertiseBlocks from '../components/ExpertiseBlocks';
import { Link } from 'react-router-dom';
import ReactBackgroundCarousel from '../components/Carousel';
import CompanyReviewsPage from '../components/CompanyReviewsPage';
import AboutUsComponent from '../components/AboutUsComponent';
import TeamComponent from './lazyHome/TeamComponent';
import LocationComponent from './lazyHome/LocationComponent';
import MapContainer from '../components/googleMapReact/MapContainer';

const Home = () => {
    const [firstImageLoaded, setFirstImageLoaded] = useState(false);
    const [showMap, setShowMap] = useState(false);
    useEffect(() => {
        const firstImage = new Image();
        firstImage.src = 'https://i.imgur.com/2seXrrT.webp';
        firstImage.onload = () => {
            setFirstImageLoaded(true);
        };
        return () => {
            firstImage.onload = null;
        };
    }, []);

    useEffect(() => {
        // Simulate loading delay of 3 seconds for the map
        const mapTimeout = setTimeout(() => {
            setShowMap(true);
        }, 1500);

        return () => clearTimeout(mapTimeout);
    }, []);

    const renderMapContainer = () => {
        if (showMap) {
            return <MapContainer />;
        }
        // Display a loading message during the delay
        return <p>Loading map...</p>;
    };
    return (
        <main className='main-content'>
            <div className='home-hero'>
                <div className='home-banner'>
                    <div className="banner-title-container">
                        <h1 style={{ color: 'black' }} className='banner-title'>
                            {" "}Compassionate{" "}
                        </h1>
                        <h1 style={{ color: 'black' }} className='banner-title'>
                            {" "}Orthopedic{" "}
                        </h1>
                        <h1 style={{ color: 'black' }} className='banner-title'>
                            {" "}Care{" "}
                        </h1>
                    </div>
                    <p style={{ color: 'black' }} className='banner-description'>
                        Experienced Medical Professionals With A Personal Touch
                    </p>
                    <div className='banner-buttons'>
                        <div className='button-wrapper'>
                            <a
                                className='btn header-button-yellow'
                                href='https://patientportal.oa-pa.com/phxportal/'>
                                Request Appointment
                                <i id="banner-btn-arrow" className="fas fa-long-arrow-alt-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <ReactBackgroundCarousel>

                </ReactBackgroundCarousel>
            </div>
            <AboutUsComponent />
            <div className='home-expertise'>
                <h2 className='section-title'>Explore Our Services</h2>
                <i className='fas fa-th'></i>
                <ExpertiseBlocks />
            </div>
            <TeamComponent />
            <LocationComponent />
            <div className='home-map'>
                {renderMapContainer()}
            </div>
            <div className='home-reviews'>
                <CompanyReviewsPage />
            </div>
        </main>
    );
};
export default Home;
