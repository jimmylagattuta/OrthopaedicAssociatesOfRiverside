import React, { useState, useEffect } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { useCsrfToken } from '../CsrfTokenContext';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'react-dropdown/style.css'
import { Form, Field } from 'react-final-form';
import { Link } from 'react-router-dom';

function RequestAppointmentForm(props) {
  const { csrfToken, setCsrfToken } = useCsrfToken();
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [selectedPatientType, setSelectedPatientType] = useState('new');
  const [selectedSex, setSelectedSex] = useState(''); // Step 1: State for selected sex
  const [selectedLocation, setSelectedLocation] = useState(''); // Step 1: State for selected location
  const [isOpenLocationDropdown, setIsOpenLocationDropdown] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(''); // Step 1: State for selected Provider
  const [isOpenProviderDropdown, setIsOpenProviderDropdown] = useState(false);

  const [state, setState] = useState({
    showDropdownLocations: false,
    showDropdownNewOrReturning: false,
    titleVarLocations: 'Select a location',
    titleVarNewOrReturning: 'New or returning patient?',
    clickShowLocations: false,
    clickShowNewOrReturning: false,
    errors: {
      fName: '',
      lName: '',
      email: '',
      phone: '',
      message: '',
      agree: '',
      recaptcha: '',
    },
    lastTyped: '',
    showAllErrors: false,
    phoneNumber: '',
    agreeToTerms: false,
    agreeToTermsText: false,
    recaptchaToken: '',
    recaptchaChecked: false,
    csrfToken: csrfToken,
    setCsrfToken: setCsrfToken,
    submitting: false, // Added to track form submission state

  });

  useEffect(() => {
    console.log('useEffect !csrfToken');
    if (!csrfToken) {
      fetchReviews();
    }
  }, []);
  
  const fetchReviews = () => {
    console.log('fetchReviews');
    
    const url =
      process.env.NODE_ENV === 'production'
        ? 'https://ortho-associates-of-riverside-12d6d06d6fbb.herokuapp.com/api/v1/pull_google_places_cache'
        : 'http://localhost:3000/api/v1/pull_google_places_cache';

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
        if (typeof data.reviews === 'string') {
          const reviewsArray = JSON.parse(data.reviews);
          if (data.csrf_token) {
            setCsrfToken(data.csrf_token);
          }
        } else {
          throw new Error('Data.reviews is not a string');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const initializeRecaptcha = () => {
    window.grecaptcha.enterprise.ready(() => {
      window.grecaptcha.enterprise.execute(process.env.REACT_APP_RECAPTCHA, { action: 'submit_form' }).then((token) => {
        setState({ ...state, recaptchaToken: token });
      });
    });
  };

  const handleSubmitRecaptcha = (values) => {
    if (values) {
      setState({ ...state, recaptchaChecked: true, errors: { ...state.errors, recaptcha: '' } });
    }
  };

  const handleAgreeChange = () => {
    setState((prevState) => ({
      ...state,
      agreeToTerms: !prevState.agreeToTerms,
    }));
  };

  const handleAgreeTextChange = () => {
    setState((prevState) => ({
      ...state,
      agreeToTermsText: !prevState.agreeToTermsText,
    }));
  };

  const formatPhoneNumber = (value) => {
    // console.log('formatPhoneNumber', value);
    if (value) {
      const phoneNumber = value.replace(/\D/g, '');
      const formattedPhoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
      return formattedPhoneNumber;
    }
    return '';
  };

  const parsePhoneNumber = (value) => {
    // console.log('parsePhoneNumber', value);
    if (value) {
      return value.replace(/\D/g, '');
    }
    return '';
  };

  const onSubmit = async (values) => {
    console.log('onSubmit', values);
    console.log('state.agreeToTerms', state.agreeToTerms);
    console.log('state.agreeToTermsText', state.agreeToTermsText);
    console.log('selectedSex', selectedSex);
    console.log('selectedLocation', selectedLocation);
    console.log('selectedProvider', selectedProvider);

    const formData = {
      ...values,
      agreeToTerms: state.agreeToTerms,
      agreeToTermsText: state.agreeToTermsText,
      selectedPatientType: selectedPatientType,
      selectedSex: selectedSex,
      selectedLocation: selectedLocation,
      selectedProvider: selectedProvider
    };
    try {
      const response = await fetch('https://ortho-associates-of-riverside-12d6d06d6fbb.herokuapp.com//api/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        console.log('Email sent successfully');
        
        // Apply the CSS animation to #appointment-form on success
        const appointmentForm = document.getElementById('appointment-form');
        if (appointmentForm) {
          appointmentForm.style.animation = 'fadeOut 1.5s ease-out';
          setTimeout(() => {
            appointmentForm.style.display = 'none';
            props.setShowThankYouMessage(true);
            setTimeout(() => {
              props.setShowThankYouMessage(false);
            }, 5000); // Adjust the time as needed
          }, 1500);
        }
      } else {
        console.error('Email sending failed');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  
  // Modify renderError to show errors only if touched or showAllErrors is true
  const renderError = (field) => {
    if (field && state.showAllErrors) {
      return (
        <div id="error-div">
          <h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
            {field}
          </h8>
        </div>
      );
    }
    return null;
  };

  // Modify renderSendButton to control opacity based on touched state
  const renderSendButton = (values, errors, form) => {
    // console.log('values', values);
    // console.log('errors', errors);
    // console.log('form', form);

    const shouldDisable = (
      !values.fName ||
      !values.lName ||
      !values.email ||
      !values.phone ||
      !values.message
    );
    const hideButtonClass = shouldDisable || state.submitting ? 'hide-button' : '';

    
    // const buttonOpacity = values ? '100%' : (Object.keys(errors).length === 0 ? 'chat-box-button-ready' : 'chat-box-button-blue');
    const buttonOpacity = shouldDisable ? '40%' : '100%';
    return (
      <div style={{ backgroundColor: 'white', justifyContent: 'flex-end', display: 'flex', padding: "0px", margin: '0px', width: '100%', borderRadius: '0px 0px 10px 10px' }}>
        <button
          id="chat-box-button"
          onClick={async (e) => {
            e.preventDefault();
            if (shouldDisable || state.submitting) {
              // console.log('shouldDisable true');
              // console.log('values', values);
              setState({ ...state, showAllErrors: true });
            } else {
              // console.log('onSubmit(values)', values);
              const isEmpty = Object.keys(errors).length === 0;
              if (isEmpty) {
                // Set the 'submitting' state to true to trigger the fade-out animation
                setState({ ...state, submitting: true });
                onSubmit(values);
                document.getElementById("chat-box-button").style.opacity = 0.3;
                setTimeout(() => {
                  document.getElementById("appointment-form").style.opacity = 0;
                }, 2000);
                setTimeout(() => {
                  form.reset();
                  props.toggleAppointmentForm('false');
                }, 3000);
              } else {
                setState({ ...state, showAllErrors: true });
              }
            }
          }}
          className={`chat-box-button ${hideButtonClass}`}
          type="submit"
          style={{ backgroundColor: "rgb(243, 117, 63)", opacity: buttonOpacity }}

        >
          Request Appointment <i style={{ justifySelf: 'center', paddingLeft: '10px' }} className="fas fa-envelope"></i>
        </button>
      </div>
    );
  };
  
  
  // Date of Birth formatter
  const formatDob = (value) => {
    // console.log('formatDate', value);
    if (value) {
      const dob = value.replace(/\D/g, '');
      const formattedDob = `${dob.slice(0, 2)}/${dob.slice(2, 4)}/${dob.slice(4, 8)}`;
      return formattedDob;
    }
    return '';
  };

  // Date of Birth parser
  const parseDob = (value) => {
    // console.log('parseDob', value);
    if (value) {
      return value.replace(/\D/g, '');
    }
    return '';
  };
  // Modify renderFieldBorder to add opacity based on touched state
  const renderFieldBorder = (error) => {
    return !error || (!state.showAllErrors && !state.touched) ? "field-id" : "field-id-red";
  };

  const handleCloseForm = () => {
    // console.log('handleCloseForm');
    props.toggleAppointmentForm(false);
    setIsFormVisible(false);
  };
  const renderPatientTypeRadio = () => {
    // console.log('renderPatientTypeRadio');
    return (
      <div className='apt-line' style={{ fontSize: "1rem", padding: "0 0 0 5px" }}>
        <div style={{ margin: '0px 0px 0px 20px', padding: '0.2rem 0.5rem', display: 'flex', flexDirection: 'column' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Are you a new or returning patient?</p>
          <div className="new-returning-div">
            <label className="apt-request-radio">
              <input
                type="radio"
                value="new"
                className='radio-circle'
                checked={selectedPatientType === 'new'}
                onChange={() => setSelectedPatientType('new')}
              />
              New
            </label>
            <label className="apt-request-radio">
              <input
                type="radio"
                value="returning"
                className='radio-circle'
                checked={selectedPatientType === 'returning'}
                onChange={() => setSelectedPatientType('returning')}
              />
              Returning
            </label>
          </div>
        </div>
      </div>
    );
  };
  const handleFieldFocus = () => {
    setState({ ...state, touched: true });
  };
  const renderSexRadio = (errors) => {
    return (
      <div className='apt-line' style={{ fontSize: "1.1rem", padding: "0 0 0 5px" }}>
        <div style={{ margin: '20px 0px 0px 20px', padding: '0.2rem 0.5rem', display: 'flex', flexDirection: 'column' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>Sex</p>
          <div className="new-returning-div">
            <label className="apt-request-radio">
              <input
                type="radio"
                value="male"
                className='radio-circle'
                checked={selectedSex === 'male'} // Step 3: Use selectedSex state
                onChange={() => setSelectedSex('male')} // Step 2: Handle sex change
              />
              Male
            </label>
            <label className="apt-request-radio">
              <input
                type="radio"
                value="female"
                className='radio-circle'
                checked={selectedSex === 'female'} // Step 3: Use selectedSex state
                onChange={() => setSelectedSex('female')} // Step 2: Handle sex change
              />
              Female
            </label>
            <label className="apt-request-radio">
              <input
                type="radio"
                value="other"
                className='radio-circle'
                checked={selectedSex === 'other'} // Step 3: Use selectedSex state
                onChange={() => setSelectedSex('other')} // Step 2: Handle sex change
              />
              Other
            </label>
          </div>
        <div style={{ marginBottom: '0.3rem' }}>
            {renderError(errors.selectedSex)}
        </div>
        </div>
      </div>
    );
  };
  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };
  return (
    <Form
      validate={(values) => {
        const errors = {};

        if (!values.fName) {
          errors.fName = "First Name is empty";
        } else if (values.fName.length > 20) {
          errors.fName = "First Name is too long";
        } else if (!/^[a-z]+$/i.test(values.fName)) {
          errors.fName = "First Name can only contain letters";
        }

        if (!values.lName) {
          errors.lName = "Last Name is empty";
        } else if (values.lName.length > 30) {
          errors.lName = "Last Name is too long";
        } else if (!/^[a-z]+$/i.test(values.lName) && !values.lName.includes("-")) {
          errors.lName = "Last Name can only contain letters";
        }

        if (!values.email) {
          errors.email = "Email is empty";
        } else if (values.email.length > 40 || !values.email.includes('@')) {
          errors.email = "Please enter a valid email format";
        }

        if (!values.phone) {
          errors.phone = "Phone is empty";
        } else if (values.phone.length < 10) {
          errors.phone = "Phone is incomplete"
        }

        if (!state.agreeToTerms) {
          errors.agree = 'Please agree to Privacy Policy & Terms of Use';
        }

        if (!values.message) {
          errors.message = "Message is empty";
        } else if (values.message.length > 2000) {
          errors.message = "Message is too long";
        }

        if (!values.dob) {
          errors.dob = 'Date of birth is required';
        } else if (values.dob.length < 8) {
          errors.dob = 'Date of birth is missing numbers';
        } else {
          const month = parseInt(values.dob.substr(0, 2), 10);
          const day = parseInt(values.dob.substr(2, 2), 10);
          const year = parseInt(values.dob.substr(4, 4), 10);
          const dobDate = new Date(year, month - 1, day);
      
          if (
            isNaN(dobDate.getTime()) || // Invalid date
            dobDate.getMonth() + 1 !== month || // Month mismatch
            dobDate.getDate() !== day || // Day mismatch
            dobDate.getFullYear() !== year // Year mismatch
          ) {
            errors.dob = 'Invalid date';
          }
        }

        if (!selectedSex) {
          errors.selectedSex = "Please fill in the field";
        }

        if (!selectedLocation) {
          errors.location = "Please select a location";
        }

        if (!selectedProvider) {
          errors.provider = "Please select a Provider";
        }

        // setState({ ...state, errors });

        return errors;
      }}
      onSubmit={onSubmit}
      render={({ handleSubmit, values, errors, form }) => (
        <form
          className='popout-content'
          style={{
            display: 'flex',
            // maxWidth: '80%',
            height: '100vh',
            width: '100vw',
            flexDirection: 'column',
            backgroundColor: 'rgba(0,0,0,.8)',
            position: 'fixed',
            zIndex: 12,
            top: "50%",
            padding: "0px 0px 0px 0px",
            margin: "0px",
            borderRadius: "0px",
            left: "50%",
            alignItems: 'center',
            justifyContent: 'center',
            transform: "translate(-50%, -50%)",
            overflowY: 'scroll'
          }}
          onSubmit={handleSubmit}
        > 
          <div id="appointment-form">

            <div className="form-title">
                <p className="title-request-appointment">
                        Appointment Request
                </p>
                <button className="close-button" onClick={handleCloseForm}>x</button>
            </div>
            <div style={{ maxHeight: '100%', minWidth: '150px', alignSelf: 'center', padding: '10px 10px 0px 0px', margin: '0px', backgroundColor: 'white', overflowY: 'scroll' }} id="chatbox-div">
                <div id="chat-middle-component-request-apt">
                <div id="middle-form-top-div">
                    <div style={{ justifyContent: 'flex-start', display: 'flex' }} id="chat-form-top-div">
                    <div id="chat-form-inner-div" style={{ width: '97%' }}>
                        {renderPatientTypeRadio()}
                        <div className="apt-line" style={{ display: 'flex', flex: '1'  }}>
                            <div id="chat-form-lines-request-apt">
                            <label style={{ fontSize: "0.9rem", padding: "0 0 0 5px" }}>First Name</label>
                            <Field
                                key="fNameKey"
                                id={renderFieldBorder(errors.fName)}
                                style={{ borderRadius: '10px', paddingLeft: '5px' }}
                                name="fName"
                                component="input"
                                />
                            <div style={{ marginBottom: '0.3rem' }}>
                                {renderError(errors.fName)}
                            </div>
                            </div>
                            <div id="chat-form-lines-request-apt">
                            <label style={{ fontSize: "0.9rem", padding: "0 0 0 5px" }}>Last Name</label>
                            <Field
                                key="lNameKey"
                                id={renderFieldBorder(errors.lName)}
                                style={{ borderRadius: '10px', paddingLeft: '5px' }}
                                name="lName"
                                component="input"
                                />
                            <div style={{ marginBottom: '0.3rem' }}>
                                {renderError(errors.lName)}
                            </div>
                            </div>


                            <div id="chat-form-lines-request-apt">
                            <label style={{ fontSize: "0.9rem", padding: "0 0 0 5px" }}>Phone</label>
                            <Field
                                id={renderFieldBorder(errors.phone)}
                                style={{ borderRadius: '10px', paddingLeft: '5px' }}
                                type="tel"
                                name="phone"
                                label="Phone"
                                component="input"
                                placeholder="(•••) ••• ••••"
                                parse={parsePhoneNumber}
                                format={formatPhoneNumber}
                            />
                            <div style={{ marginBottom: '0.3rem' }}>
                                {renderError(errors.phone)}
                            </div>
                            </div>
                        </div>
                        <div className='apt-line' style={{ display: 'flex', flex: '1'  }}>
                            <div id="chat-form-lines-request-apt">
                            <label style={{ fontSize: "0.9rem", padding: "0 0 0 5px" }}>Date of Birth</label>
                            <Field
                                id={renderFieldBorder(errors.dob)}
                                style={{ borderRadius: '10px', paddingLeft: '5px' }}
                                type="tel"
                                name="dob"
                                component="input"
                                placeholder="MM/DD/YYYY"
                                format={formatDob} // Use the date of birth formatter
                                parse={parseDob} // Use the date of birth parser
                            />
                            <div style={{ marginBottom: '0.3rem' }}>
                                {renderError(errors.dob)}
                            </div>
                            </div>
                            <div id="chat-form-lines-request-apt">
                                <label style={{ fontSize: "0.9rem", padding: "0 0 0 5px" }}>Email</label>
                                <Field
                                    key="emailKey"
                                    id={renderFieldBorder(errors.email)}
                                    style={{ borderRadius: '10px', paddingLeft: '5px' }}
                                    name="email"
                                    component="input"
                                />
                                <div style={{ marginBottom: '0.3rem' }}>
                                    {renderError(errors.email)}
                                </div>
                                </div>
                        </div>

                        {renderSexRadio(errors)}


                        <div className='apt-line' style={{ fontSize: "1.1rem", padding: "0 0 0 5px" }}>
                          <div style={{ margin: '20px 0px 0px 20px', padding: '0.2rem 0.5rem', display: 'flex', flexDirection: 'column' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Location</p>
                            <div onClick={() => setIsOpenLocationDropdown(!isOpenLocationDropdown)}  className="select-location">
                              <div className='select-location-title-and-list'>
                                <div id="select-location-title">
                                  {selectedLocation || 'Select a Location'}
                                </div>
                                <div id="select-location-icon">
                                  {isOpenLocationDropdown ? (
                                    <i class="fas fa-angle-down fa-rotate-180"></i>
                                  ) : (
                                    <i class="fas fa-angle-down"></i>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: isOpenLocationDropdown ? 'flex' : 'none', flexDirection: 'column' }}>
                                {['East Los Angeles', 'Wilshire', 'Santa Fe Springs', 'Tarzana', 'Encino', 'Valencia', 'Montebello', 'Glendale'].map((location, index) => (
                                  <div
                                    key={index}
                                    onClick={() => setSelectedLocation(location)}
                                    style={{ display: 'flex' }}
                                    id="provider-location"
                                  >
                                    {location}
                                  </div>
                                ))}
                              </div>
                            </div>
                          <div style={{ marginBottom: '0.3rem' }}>
                              {renderError(errors.location)}
                          </div>
                          </div>
                        </div>


                        <div className='apt-line' style={{ fontSize: "1.1rem", padding: "0 0 20px 5px" }}>
                          <div style={{ margin: '20px 0px 0px 20px', padding: '0.2rem 0.5rem', display: 'flex', flexDirection: 'column' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Provider</p>
                            <div onClick={() => setIsOpenProviderDropdown(!isOpenProviderDropdown)}  className="select-location">
                              <div className='select-location-title-and-list'>
                                <div id="select-location-title">
                                  {selectedProvider || 'Select a Provider'}
                                </div>
                                <div id="select-location-icon">
                                  {isOpenProviderDropdown ? (
                                    <i class="fas fa-angle-down fa-rotate-180"></i>
                                  ) : (
                                    <i class="fas fa-angle-down"></i>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: isOpenProviderDropdown ? 'flex' : 'none', flexDirection: 'column' }}>
                                {["Daniel Rivas-Tejeda", "Annie Yang", "Bryan Sandoval", "David Moriel", "Dr. Perrone", "Nora Nazarian", "Natalie Hammond", "Dr. Collazo", "Dr. Jason Kaushik", "Dr. Sugi", "Dr. Daniel Acevedo", "Dr. Marcus", "Dr. Barba", "Dr. Bastian", "Dr. Cho", "Dr. Cikra", "Dr. Desai", "Dr. Dworsky", "Dr. Longacre", "Dr. Lu", "Dr. Malafa", "Dr. Pickrell", "Dr. Wang", "Dr. Yasmeh", "Felipe Nunez", "John Giannini", "Jonathan Naick", "Mark Lee", "Michelle Chang", "Whitty Li", "Matthew Lee", "Gerardo Cudich"].map((provider, index) => (
                                  <div
                                    key={index}
                                    onClick={() => setSelectedProvider(provider)}
                                    style={{ display: 'flex' }}
                                    id="provider-location"
                                  >
                                    {provider}
                                  </div>
                                ))}
                              </div>
                            </div>
                          <div style={{ marginBottom: '0.3rem' }}>
                              {renderError(errors.provider)}
                          </div>
                          </div>
                        </div>


                       
                        <div id="chat-form-lines-request-apt">
                            <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', textAlign: "left", paddingRight: '10px' }}>
                                <label style={{ fontSize: "1rem", padding: "10px 0 0 5px" }}>Reason for appointment</label>
                                <Field id={renderFieldBorder(errors.message)} style={{ border: 'none', borderRadius: '10px 10px 10px 10px', backgroundColor: "rgba(192,200,200, 25%)", zIndex: '10', width: '97%', paddingLeft: '5px', paddingTop: '5px' }} name="message" component="textarea" rows="5" />
                                {renderError(errors.message)}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', margin: '0px 0px 10px 0px', padding: '0.2rem 0.5rem'  }} id="chat-middle-component">
                        <div style={{ displa: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <div id="terms-and-policy">
                                <label>
                                <input
                                    type="checkbox"
                                    name="terms"
                                    style={{ transform: 'scale(2)' }}
                                    checked={state.agreeToTerms}
                                    onChange={handleAgreeChange}
                                />
                                </label>
                            </div>
                            <div style={{ fontSize: "0.9rem" }} id="terms-and-policy">
                                I have read and agreed to the Privacy Policy and Terms of Use and I am at least 13 and have the authority to make this appointment.
                            </div>
                            </div>
                            <div style={{ marginBottom: '0.3rem' }}>
                            {renderError(errors.agree)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <div id="terms-and-policy">
                                <label>
                                <input
                                    type="checkbox"
                                    name="termsText"
                                    style={{ transform: 'scale(2)' }}
                                    checked={state.agreeToTermsText}
                                    onChange={handleAgreeTextChange}
                                />
                                </label>
                            </div>
                            <div style={{ fontSize: "0.9rem" }} id="terms-and-policy">
                                I agree to receive text messages from this practice and understand that message frequency and data rates may apply.
                            </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ margin: '0px 0px 10px 0px', padding: '0.2rem 0.5rem' }} id="chat-form-lines-request-apt">
                            <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', textAlign: "left" }}>
                                <label style={{ fontSize: "0.9rem", padding: "10px 10px 10px 10px", borderTop: '1px solid var(--grey-light)', borderBottom: '1px solid var(--grey-light)',}}>For HMO patients, kindly include your authorization number in the comment box. Please be aware that appointment availability may affect our ability to schedule your preferred provider.</label>
                            </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            {renderError(errors.errorMain)}
            {renderSendButton(values, errors, form)}
          </div>
        </form>
      )}
    />
  );
};

export default RequestAppointmentForm;
