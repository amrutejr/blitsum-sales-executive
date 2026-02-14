import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 cursor-pointer text-decoration-none";

    // Note: Using inline styles or classes mapping to the CSS variables we defined
    // Since we are using vanilla CSS, we will apply classes that match our styles.css structure
    // For proper React pattern, we might want to use CSS modules or styled-components later.
    // For now, we'll map to the classes defined in index.css

    const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-outline';

    // We are using the classes from global CSS (btn, btn-primary etc)
    // Re-implementing the classes inline here specifically for React if we want component isolation,
    // but simpler to rely on the global CSS we just ported for now.

    return (
        <a
            className={`btn ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </a>
    );
};

export default Button;
