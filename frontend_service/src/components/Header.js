import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { isLoggedIn, user } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    Hotel Booking
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/about" activeClassName="active">
                                About
                            </NavLink>
                        </li>
                        {isLoggedIn ? (
                            <>
                                {user?.role === 'staff' && (
                                    <li className="nav-item">
                                        <NavLink
                                            className="nav-link"
                                            to="/hotels/user"
                                            activeClassName="active"
                                        >
                                            My Hotels
                                        </NavLink>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <NavLink
                                        className="nav-link"
                                        to="/hotels"
                                        activeClassName="active"
                                    >
                                        Hotels
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <div class="btn-group" role="group" aria-label="Basic example">
                                        <NavLink
                                            className="btn btn-secondary"
                                            to="/profile"
                                            activeClassName="active"
                                        >
                                            {user?.username} ({user?.role})
                                        </NavLink>
                                        <NavLink
                                            className="btn btn-secondary"
                                            to="/logout"
                                            activeClassName="active"
                                        >
                                            Logout
                                        </NavLink>
                                    </div>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <div class="btn-group" role="group" aria-label="Basic example">
                                        <NavLink
                                            className="btn btn-secondary"
                                            to="/login"
                                            activeClassName="active"
                                        >
                                            Login
                                        </NavLink>
                                        <NavLink
                                            className="btn btn-secondary"
                                            to="/registration"
                                            activeClassName="active"
                                        >
                                            Register
                                        </NavLink>
                                    </div>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
