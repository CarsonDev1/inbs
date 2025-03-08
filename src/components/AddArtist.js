import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AddArtist.css';

function AddArtist() {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    experience: '',
    breakTime: '',
    storeAddress: '',
    status: true,
    totalBooking: 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Đọc file data.json hiện tại
      const response = await fetch('/data.json');
      const currentData = await response.json();

      // Tạo artist mới
      const newArtist = {
        name: formData.name,
        contact: formData.contact,
        status: true,
        experience: formData.experience.toString(),
        breakTime: formData.breakTime || "????",
        totalBooking: "0",
        storeAddress: formData.storeAddress,
        id: (currentData.length + 1).toString()
      };

      // Thêm artist mới vào mảng hiện tại
      currentData.push(newArtist);

      // Ghi lại vào file data.json
      const writeResponse = await fetch('/api/updateData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentData)
      });

      if (!writeResponse.ok) {
        throw new Error('Failed to update data.json');
      }

      alert('Artist added successfully!');
      navigate('/artist');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add artist: ' + error.message);
    }
  };

  const handleLogout = () => navigate('/');
  const handleHome = () => navigate('/home');
  const handleStore = () => navigate('/store');
  const handleWaitlist = () => navigate('/waitlist');
  const handleArtist = () => navigate('/artist');

  return (
    <div className="add-artist-container">
      <div 
        className={`sidebar ${showSidebar ? 'expanded' : ''}`}
        onMouseEnter={() => setShowSidebar(true)}
        onMouseLeave={() => setShowSidebar(false)}
      >
        <div className="logo">
          <h1 className={showSidebar ? 'expanded' : ''}>
            {showSidebar ? 'INBS' : 'IB'}
          </h1>
        </div>

        <div className="nav-buttons">
          <button onClick={handleHome} className="nav-button">
            <span style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>🏠</span>
            {showSidebar && 'Home'}
          </button>

          <button onClick={handleStore} className="nav-button">
            <span style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>📊</span>
            {showSidebar && 'Store'}
          </button>

          <button onClick={handleArtist} className="nav-button">
            <span style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>👩‍🎨</span>
            {showSidebar && 'Artist'}
          </button>

          <button onClick={handleWaitlist} className="nav-button">
            <span style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>⏳</span>
            {showSidebar && 'Waitlist'}
          </button>

          <button onClick={handleLogout} className="nav-button logout">
            <span style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>⬅️</span>
            {showSidebar && 'Logout'}
          </button>
        </div>
      </div>

      <div className={`main-content ${showSidebar ? 'sidebar-expanded' : ''}`}>
        <div className="form-container">
          <h2>Add New Artist</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact:</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Experience (years):</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Break Time:</label>
              <input
                type="text"
                name="breakTime"
                value={formData.breakTime}
                onChange={handleInputChange}
                placeholder="e.g., 12:00-13:00"
                required
              />
            </div>

            <div className="form-group">
              <label>Store Address:</label>
              <input
                type="text"
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="button-group">
              <button type="button" onClick={() => navigate('/artist')} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Add Artist
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddArtist; 