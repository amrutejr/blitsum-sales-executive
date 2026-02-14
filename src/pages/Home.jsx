import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Integrations from '../components/Integrations';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';

const Home = () => {
    return (
        <>
            <Hero />
            <HowItWorks />
            <Features />
            <Integrations />
            <FAQ />
            <FinalCTA />
        </>
    );
};

export default Home;
