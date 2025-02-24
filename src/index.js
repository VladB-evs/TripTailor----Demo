import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './animations.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Initialize Intersection Observer for reveal animations
const initRevealAnimations = () => {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
  });
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize animations after render
document.addEventListener('DOMContentLoaded', initRevealAnimations);

reportWebVitals();
