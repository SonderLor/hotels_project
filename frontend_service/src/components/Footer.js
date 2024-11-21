import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-3 mt-auto">
            <div className="container text-center">
                <p>&copy; {new Date().getFullYear()} Hotel Booking. Все права защищены.</p>
            </div>
        </footer>
    );
};

export default Footer;
