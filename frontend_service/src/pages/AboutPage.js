import React from 'react';

const AboutPage = () => {
    return (
        <div className="container mt-5">
            <h2>About the Project</h2>
            <p>
                This project is designed to help users easily find and book hotels worldwide.
                Our mission is to make the booking process simple, fast, and convenient.
            </p>
            <ul className="list-group mt-3">
                <li className="list-group-item">User-friendly interface</li>
                <li className="list-group-item">Quick search</li>
                <li className="list-group-item">Wide range of hotels</li>
            </ul>
        </div>
    );
};

export default AboutPage;
