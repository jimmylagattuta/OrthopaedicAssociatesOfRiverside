import React, { useState, useEffect } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { useCsrfToken } from '../CsrfTokenContext'; // Import the hook
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'react-dropdown/style.css'
import { Form, Field } from 'react-final-form';
import { Link } from 'react-router-dom';

function ChatBox(props) {
  const { csrfToken,setCsrfToken } = useCsrfToken();

  const [state, setState] = useState({
    showDropdownLocations: false,
    showDropdownNewOrReturning: false,
    titleVarLocations: 'Select a location',
    titleVarNewOrReturning: 'New or returning patient?',
    titleLocations: 'Select a location',
    titleNewOrReturning: 'New or returning patient?',
    clickShowLocations: false,
    clickShowNewOrReturning: false,
    errorFName: "",
    errorFNameShow: false,
    errorLName: "",
    errorLNameShow: false,
    errorEmail: "",
    errorEmailShow: false,
    errorPhone: "",
    errorPhoneShow: false,
    errorMessage: "",
    errorMessageShow: false,
    errorMain: "",
    errorMainShow: false,
    lastTyped: '',
    showAllErrors: false,
    phoneNumber: '',
    agreeToTerms: false,
    errorAgree: '',
    recaptchaToken: '',
    recaptchaChecked: false,
    errorRecaptcha: '',
    csrfToken: csrfToken,
    setCsrfToken: setCsrfToken
  });

  useEffect(() => {
    // Load and initialize reCAPTCHA
    const loadRecaptchaScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${process.env.REACT_APP_RECAPTCHA}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize reCAPTCHA with your site key
        window.grecaptcha.enterprise.ready(() => {
          window.grecaptcha.enterprise.execute(process.env.REACT_APP_RECAPTCHA, { action: 'submit_form' }).then((token) => {
            setState({ ...state, recaptchaToken: token });
          });
        });
      };
      document.head.appendChild(script);
    };

    loadRecaptchaScript();

    if (!csrfToken) {
      fetchReviews();
    }
  }, []);
  const fetchReviews = () => {
          
    const url =
      process.env.NODE_ENV === 'production'
        ? 'https://ortho-associates-of-riverside-12d6d06d6fbb.herokuapp.com/api/v1/pull_google_places_cache'
        : 'http://localhost:3000/api/v1/pull_google_places_cache';
  
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
        if (typeof data.reviews === 'string') {
          // Parse the JSON string into an array
          const reviewsArray = JSON.parse(data.reviews);
          // Set the CSRF token in the context (if needed)
          if (data.csrf_token) {
            setCsrfToken(data.csrf_token);
          }
  
          // Filter reviews with the default profile photo URLs

          // Shuffle the filteredReviews array
  
          // Take the first three reviews
  

        } else {
          throw new Error('Data.reviews is not a string');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  

  const loadRecaptchaScript = () => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${process.env.REACT_APP_RECAPTCHA}`;
    script.async = true;
    script.defer = true;
    script.onload = initializeRecaptcha;
    document.head.appendChild(script);
  };

  const initializeRecaptcha = () => {
    // Initialize reCAPTCHA with your site key
    window.grecaptcha.enterprise.ready(() => {
      window.grecaptcha.enterprise.execute(process.env.REACT_APP_RECAPTCHA, { action: 'submit_form' }).then((token) => {
        setState({ ...state, recaptchaToken: token });
      });
    });
  };

  const handleSubmitRecaptcha = (values) => {
    if (values) {
      setState({ ...state, recaptchaChecked: true, errorRecaptcha: '' });
    }
    // Here, you can use state.recaptchaToken in your form submission
    // to validate the reCAPTCHA response.

    // Perform your form submission logic
    // ...
  };

  const handleAgreeChange = () => {
    setState((prevState) => ({
      ...state,
      agreeToTerms: !prevState.agreeToTerms, // Toggle the value
    }));
  };

  const formatPhoneNumber = (value) => {
    if (value) {
      // Remove all non-numeric characters from the input
      const phoneNumber = value.replace(/\D/g, '');

      // Format the phone number as (XXX) XXX-XXXX
      const formattedPhoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;

      return formattedPhoneNumber;
    }

    return ''; // Return an empty string for undefined or null values
  };

  const parsePhoneNumber = (value) => {
    if (value) {
      // Remove all non-numeric characters from the input
      return value.replace(/\D/g, '');
    }

    return ''; // Return an empty string for undefined or null values
  };

  const onSubmit = async (values) => {
    const formData = {
      ...values, // Include the form values
      recaptcha: state.recaptchaChecked,
      agreeToTerms: state.agreeToTerms,
    };
    try {
      const response = await fetch('https://ortho-associates-of-riverside-12d6d06d6fbb.herokuapp.com/api/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Email sent successfully
        console.log('Email sent successfully');
        // You can also reset the form or perform any other actions here
      } else {
        // Email sending failed
        console.error('Email sending failed');
        // Handle the error or display a message to the user
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Handle the error
    }
  };
	const renderErrorEmail = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
	const renderErrorPhone = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}

	const renderErrorFName = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
	const renderErrorLName = (error) => {
		if (error && state.showAllErrors) {

			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
	const renderErrorLocations = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.9rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
	const renderErrorNewOrReturning = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.9rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
	const renderErrorMessage = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
	const renderErrorRecaptcha = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
	const renderErrorAgree = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
	const renderErrorMain = (error) => {
		if (error && state.showAllErrors) {
			return (
				<div id="error-div">
					<h8 style={{ display: 'flex', color: 'red', fontSize: '0.8rem', padding: '0rem', margin: '0rem' }}>
						{error}
					</h8>
				</div>
			)
		}
	}
  const renderSendButton = (values, errors, form) => {
    if (
      values.fName ||
      values.lName ||
      values.email ||
      values.phone ||
      values.message ||
      state.recaptchaChecked ||
      state.agreeToTerms
    ) {
      if (Object.keys(errors).length === 0) {
        return (
          <button
            id="chat-box-button-ready"
            onClick={(e) => {
              e.preventDefault();
              onSubmit(values);
              document.getElementById("chat-middle-component").style.opacity = '0%';
              document.getElementById("chatbox-div").style.backgroundColor = 'rgba(105,116,146, 40%)';
              document.getElementById("chatbox-div").style.opacity = '0%';
			        document.getElementById("chat-box-button-ready").style.opacity = '0%';
              setTimeout(() => {
                form.reset();
              }, 3000);

              // !!!!!
              // document.getElementById("giant icon guy")
              // !!!!!
            }}
            type="submit"
          >
            SEND
          </button>
        );
      } else {
        return (
          <button
            id="chat-box-button-blue"
            onClick={(e) => {
              setState({ ...state, showAllErrors: true });
              e.preventDefault();
            }}
            type="submit"
          >
            SEND
          </button>
        );
      }
    } else {
      return (
        <button
          id="chat-box-button"
          onClick={(e) => {
            e.preventDefault();
          }}
          type="submit"
        >
          SEND
        </button>
      );
    }
  };

  const renderBorderFName = (errors) => {
    if (!errors.fName || !state.showAllErrors) {
      return "field-id";
    } else {
      return "field-id-red";
    }
  };

  const renderBorderLName = (errors) => {
    if (!errors.lName || !state.showAllErrors) {
      return "field-id";
    } else {
      return "field-id-red";
    }
  };

  const renderBorderEmail = (errors) => {
    if (!errors.email || !state.showAllErrors) {
      return "field-id";
    } else {
      return "field-id-red";
    }
  };

  const renderBorderPhone = (errors) => {
    if (!errors.phone || !state.showAllErrors) {
      return "field-id";
    } else {
      return "field-id-red";
    }
  };

  const renderBorderMessage = (errors) => {
    if (!errors.message || !state.showAllErrors) {
      return "field-id";
    } else {
      return "field-id-red";
    }
  };

  return (
    <Form
      validate={(values) => {
        const errors = {};
        let newObject = [];

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
        } else if (!/^[a-z]+$/i.test(values.lName)) {
          if (!values.lName.includes("-")) {
            errors.lName = "Last Name can only contain letters";
          }
        }

        if (!values.email) {
          errors.email = "Email is empty";
        } else if (values.email.length > 40) {
          errors.email = "Email is too long";
        } else if (!values.email.includes('@')) {
          errors.email = "Please enter a valid email format";
        }

        if (!values.phone) {
          errors.phone = "Phone is empty";
        }

        if (!state.agreeToTerms) {
          errors.agree = 'Please Agree To Terms & Conditions';
        }

        if (!values.message) {
          errors.message = "Message is empty";
        } else if (values.message.length > 2000) {
          errors.message = "Message is too long";
        }

        if (!state.recaptchaChecked) {
          errors.recaptcha = "Please Prove You're Not A Robot";
        }

        return errors;
      }}
      onSubmit={onSubmit}
      render={({ props, handleSubmit, values, errors, form }) => (
        <form
          className='popout-content'
          style={{
            display: 'flex',
            maxWidth: '80%',
            flexDirection: 'column',
            backgroundColor: 'white',
          }}
          onSubmit={handleSubmit}>
          <p style={{ fontWeight: '400', letterSpacing: '0.05rem', alignSelf: 'center', fontSize: '0.8rem', fontFamily: 'sans-serif', paddingTop: '10px' }}>CONTACT US</p>
          <h2 style={{ fontWeight: '400', letterSpacing: '0.01rem', alignSelf: 'center', fontFamily: 'sans-serif', padding: '10px 5px 0px 5px', marginBottom: '0px' }}>Send A Message To Los Angeles Orthopedic Surgery Specialists</h2>
          <p style={{ fontWeight: '400', alignSelf: 'center', fontSize: '0.9rem', padding: '10px 10px 0px 10px', maxWidth: '90%' }}>If you have any questions, concerns, or comments regarding Los Angeles Orthopedic Surgery Specialists, please fill out the short contact form below.</p>

          <div style={{ maxWidth: '90%', alignSelf: 'center', padding: '10px 10px 0px 10px' }} id="chatbox-div">
            <div id="chat-middle-component">
              <div id="middle-form-top-div">
                <div id="chat-form-top-div">
                  <div id="chat-form-inner-div">
                    <div id="chat-form-lines">
                      <Field
                        key="fNameKey"
                        id={renderBorderFName(errors)}
                        style={{ borderRadius: '10px' }}
                        name="fName"
                        component="input"
                        placeholder="First Name"
                      />
                      <div style={{ marginBottom: '0.3rem' }}>
                        {renderErrorFName(errors.fName)}
                      </div>
                    </div>
                    <div id="chat-form-lines">
                      <Field
                        key="lNameKey"
                        id={renderBorderLName(errors)}
                        style={{ borderRadius: '10px' }}
                        name="lName"
                        component="input"
                        placeholder="Last Name"
                      />
                      <div style={{ marginBottom: '0.3rem' }}>
                        {renderErrorLName(errors.lName)}
                      </div>
                    </div>
                    <div id="chat-form-lines">
                      <Field
                        key="emailKey"
                        id={renderBorderEmail(errors)}
                        style={{ borderRadius: '10px' }}
                        name="email"
                        component="input"
                        placeholder="Email address"
                      />
                      <div style={{ marginBottom: '0.3rem' }}>
                        {renderErrorEmail(errors.email)}
                      </div>
                    </div>
                    <div id="chat-form-lines">
                      <Field
                        id={renderBorderPhone(errors)}
                        style={{ padding: '0.5rem', borderRadius: '10px' }}
                        type="tel" // Use type="tel" for phone numbers
                        name="phone"
                        component="input"
                        placeholder="(•••) ••• ••••"
                        parse={parsePhoneNumber} // Parse the phone number
                        format={formatPhoneNumber} // Format the phone number
                      />
                      <div style={{ marginBottom: '0.3rem' }}>
                        {renderErrorPhone(errors.phone)}
                      </div>
                    </div>
                  </div>
                  {renderErrorMain(state.errorMain)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }} id="chat-middle-component">
              <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}>
                <Field id={renderBorderMessage(errors)} style={{ resize: 'none', border: 'none', borderRadius: '10px 10px 10px 10px', backgroundColor: "rgba(192,200,200, 25%)", zIndex: '10', width: '90%', padding: '0.5rem 0.5rem 0rem 0.5rem' }} name="message" component="textarea" rows="5" placeholder="Comments" />
                {renderErrorMessage(errors.message)}
              </div>
              <div style={{ displa: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
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
                  <div id="terms-and-policy">
                    By clicking I understand and agree that any information submitted will be forwarded to our office by email and not via a secure messaging system. This form should not be used to transmit private health information, and we disclaim all warranties with respect to the privacy and confidentiality of any information submitted through this form.
                  </div>
                </div>
                <div style={{ marginBottom: '0.3rem' }}>
                  {renderErrorAgree(errors.agree)}
                </div>
              </div>
              <ReCAPTCHA
                className='g-recaptcha'
                sitekey={process.env.REACT_APP_RECAPTCHA} // Use the environment variable
                onChange={handleSubmitRecaptcha}
              />
              <div style={{ marginBottom: '0.3rem' }}>
                {renderErrorRecaptcha(errors.recaptcha)}
              </div>
            </div>
          </div>
          {renderSendButton(values, errors, form)}
        </form>
      )}
    />
  );
};
export default ChatBox;
