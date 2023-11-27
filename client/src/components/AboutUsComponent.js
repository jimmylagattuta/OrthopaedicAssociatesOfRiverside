import { Link, NavLink } from 'react-router-dom';

const AboutUsComponent = () => {
    return (
        <div className='about-container'>
            <div className='about-container-top'>
                <h1 className='about-title'>Orthopaedic Associates of Riverside</h1>
                <p className='about-description'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sagittis placerat odio, id tincidunt justo dictum eget. Nunc tincidunt, quam id volutpat dictum, purus odio laoreet tellus, quis tristique odio nisi eget ex. Sed luctus vel ipsum sit amet bibendum. Nullam lacinia tellus a est tincidunt, vel bibendum purus gravida. Fusce feugiat dui nec justo mattis, ut placerat urna gravida. Morbi et nunc eu urna volutpat suscipit. Aenean efficitur eros vel nisi malesuada venenatis. Donec et volutpat libero. Suspendisse feugiat justo non erat bibendum, eget viverra dolor pharetra.
                </p>
            </div>
            <div className='about-container-bottom'>
                <img className='about-container-bottom-left'
                />
                <div className='about-container-bottom-right'>
                <h2 className='about-title-right'>
                    About OAR
                </h2>
                <p className='about-description-right'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sagittis placerat odio, id tincidunt justo dictum eget. Nunc tincidunt, quam id volutpat dictum, purus odio laoreet tellus, quis tristique odio nisi eget ex. Sed luctus vel ipsum sit amet bibendum. Nullam lacinia tellus a est tincidunt, vel bibendum purus gravida. Fusce feugiat dui nec justo mattis, ut placerat urna gravida. Morbi et nunc eu urna volutpat suscipit. Aenean efficitur eros vel nisi malesuada venenatis. Donec et volutpat libero. Suspendisse feugiat justo non erat bibendum, eget viverra dolor pharetra.
                </p>
                <p className='about-description-right'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sagittis placerat odio, id tincidunt justo dictum eget. Nunc tincidunt, quam id volutpat dictum, purus odio laoreet tellus, quis tristique odio nisi eget ex. Sed luctus vel ipsum sit amet bibendum. Nullam lacinia tellus a est tincidunt, vel bibendum purus gravida. Fusce feugiat dui nec justo mattis, ut placerat urna gravida. Morbi et nunc eu urna volutpat suscipit. Aenean efficitur eros vel nisi malesuada venenatis. Donec et volutpat libero. Suspendisse feugiat justo non erat bibendum, eget viverra dolor pharetra.
                </p>
                
                <div className='about-right-button'>
                    <NavLink className='btn header-button-white' to='/about'>
                        Learn More
                    </NavLink>
                </div>

                </div>
            </div>
        </div>
    );
};

export default AboutUsComponent;
