import { NavLink, Link } from 'react-router-dom';

import { navMenu } from '../data';
import { useState } from 'react';
import RequestAppointmentForm from './helpers/RequestAppointmentForm';
const Navbar = () => {
    const [isMobileMenuopen, setIsMobileMenuOpen] = useState(false);
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(null);
    const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false); // State to manage appointment form visibility
    const [showThankYouMessage, setShowThankYouMessage] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuopen);
    };
    const submenuOpen = (menuName) => {
        isSubmenuOpen === menuName
            ? setIsSubmenuOpen(null)
            : setIsSubmenuOpen(menuName);
    };

    const resetMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsSubmenuOpen(null);
    };
    const toggleAppointmentForm = () => {
        console.log('toggleAppointmentForm');
        setIsAppointmentFormOpen(!isAppointmentFormOpen);
    };
    return (
        <header className='main-header'>
            <div className='header-top'>
                <button
                    className='mobile-menu-button'
                    onClick={toggleMobileMenu}
                    style={{ color: 'white' }}
                    >
                    
                    <i
                        className={
                            isMobileMenuopen ? 'fa fa-times' : 'fa fa-bars'
                        }
                        aria-hidden='true'></i>
                </button>
                <div className='header-image-container'>
                    <Link to='/' className='logo-link'>
                        <img
                            src='https://i.imgur.com/1M8ZlnK.webp'
                            alt='LA Ortho Associates'
                            className='header-image'
                            style={{ width: '200px' }}
                        />

                    </Link>
                </div>
                <div className='header-buttons-container'>
                    <div className="navbar-oar-buttons">
                        <NavLink className='btn header-button-dark' to='/locations'>
                            Call Us
                        </NavLink>
                        <a
                            className='btn header-button-yellow'
                            onClick={toggleAppointmentForm}
                            >
                            Request Appointment
                        </a>
                    </div>
                    <div className="navbar-special-buttons">
                        <a href="https://www.facebook.com/orthoriverside" target="_blank">
                            <i style={{ padding: '10px', fontSize: '1.5rem', color: 'white' }} className="fab fa-facebook"></i>
                        </a>
                        <div
                            onClick={() => console.log('Translate To English')}
                            style={{ cursor: "pointer", padding: '10px', fontSize: '2rem', alignSelf: 'center' }}
                            >
                            <img src="https://i.imgur.com/2TvF7x4.webp" alt="English Flag" />
                        </div>
                        <div
                            onClick={() => console.log('Translate To Polish')}
                            style={{ cursor: "pointer", padding: '10px', fontSize: '2rem', alignSelf: 'center' }}
                            >
                            <img src="https://i.imgur.com/95gzZ96.webp" alt="Polish Flag" />
                        </div>

                        <div
                            onClick={() => console.log('Translate To Spanish')}
                            style={{ cursor: "pointer", padding: '10px', fontSize: '2rem', alignSelf: 'center' }}
                            >
                            <img src="https://i.imgur.com/p8KxvS7.webp" alt="Spanish Flag" />
                        </div>
                        <div
                            onClick={() => console.log('Search Button')}
                            style={{ cursor: "pointer", padding: '10px', fontSize: '1.5rem' }}
                            >
                            <i style={{ color: 'white' }} class="fas fa-search"></i>
                        </div>
                    </div>


                    {isAppointmentFormOpen && (
                        <div className="appointment-form-overlay">
                            <RequestAppointmentForm toggleAppointmentForm={toggleAppointmentForm} setShowThankYouMessage={setShowThankYouMessage} />
                        </div>
                    )}
                    {showThankYouMessage && (
                        <div className="thank-you-message">
                            Thank you for the message! We will be with you shortly.
                        </div>
                    )}
                </div>
            </div>
            <nav
                className={`navbar ${isSubmenuOpen}-open ${
                    isMobileMenuopen ? 'mobile-menu-show' : ''
                }`}>
                {navMenu.map((item, index) => {
                    return (
                        <div key={index} className={`nav-link-container ${item.menu}-nav`}>
                            <div className='link-items'>
                                <NavLink
                                    onClick={resetMobileMenu}
                                    key={item.menu}
                                    to={item.link}
                                    className={({ isActive }) =>
                                        isActive
                                            ? 'nav-link active'
                                            : 'nav-link'
                                    }>
                                    {item.menu}
                                </NavLink>
                                {item.subMenuItems && (
                                    <button
                                        className='mobile-toggle-submenu'
                                        onClick={() => submenuOpen(item.menu)}>
                                        {isSubmenuOpen === item.menu ? (
                                            <i className='fas fa-minus'></i>
                                        ) : (
                                            <i className='fas fa-plus'></i>
                                        )}
                                    </button>
                                )}
                            </div>
                            {item.subMenuItems && (
                                <div className='submenu'>
                                    <NavLink
                                        onClick={resetMobileMenu}
                                        key={item.menu}
                                        to={item.link}
                                        className={({ isActive }) =>
                                            isActive
                                                ? 'sub-link mobile-nav-link active'
                                                : 'sub-link mobile-nav-link'
                                        }
                                        end>
                                        All {item.menu}
                                    </NavLink>
                                    <div className={`submenu-list ${item.subMenuItems.length > 16 ? 'submenu-multi-column' : item.subMenuItems.length > 6 ? 'submenu-two-column' : ''}`}>
                                        {item.subMenuItems.map((subItem) => {
                                            return (
                                                <NavLink
                                                    onClick={resetMobileMenu}
                                                    key={subItem}
                                                    to={`${item.link}/${subItem.toLowerCase().split(' ').join('-')}`}
                                                    className={({ isActive }) =>
                                                        isActive ? 'sub-link active' : 'sub-link'
                                                    }>
                                                    {subItem}
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </header>
    );
};
export default Navbar;
