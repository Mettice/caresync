import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';

const Home = () => {
  const navigate = useNavigate();
  
  return <LandingPage />;
};

export default Home;