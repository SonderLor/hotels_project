import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import LogoutPage from "./pages/LogoutPage";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import HotelList from './pages/HotelList';
import HotelDetails from './pages/HotelDetails';
import RoomDetails from './pages/RoomDetails';
import UserHotelsPage from './pages/UserHotelsPage';
import UserHotelDetailsPage from './pages/UserHotelDetailsPage';
import UserRoomDetailsPage from './pages/UserRoomDetailsPage';
import CreateHotelPage from './pages/CreateHotelPage';
import UpdateHotelPage from './pages/UpdateHotelPage';
import CreateRoomPage from './pages/CreateRoomPage';
import UpdateRoomPage from './pages/UpdateRoomPage';
import SearchHotelsPage from './pages/SearchHotelsPage';
import SearchRoomsPage from './pages/SearchRoomsPage';

function App() {
  return (
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/update" element={<UpdateProfilePage />} /> 
              <Route path="/hotels" element={<HotelList />} />
              <Route path="/hotels/:hotel_id" element={<HotelDetails />} />
              <Route path="/hotels/:hotel_id/rooms/:room_id" element={<RoomDetails />} />
              <Route path="/hotels/user" element={<UserHotelsPage />} />
              <Route path="/hotels/user/:hotel_id" element={<UserHotelDetailsPage />} />
              <Route path="/hotels/user/:hotel_id/rooms/:room_id" element={<UserRoomDetailsPage />} />
              <Route path="/hotels/create" element={<CreateHotelPage />} />
              <Route path="/hotels/:hotel_id/update" element={<UpdateHotelPage />} />
              <Route path="/hotels/:hotel_id/rooms/create" element={<CreateRoomPage />} />
              <Route path="/hotels/:hotel_id/rooms/:room_id/update" element={<UpdateRoomPage />} />
              <Route path="/search/hotels" element={<SearchHotelsPage />} />
              <Route path="/search/rooms" element={<SearchRoomsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
  );
}

export default App;
