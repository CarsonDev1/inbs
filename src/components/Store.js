import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Store.css';

function Store() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [services, setServices] = useState([]);
  const [nailDesigns, setNailDesigns] = useState([]);
  const [activeTab, setActiveTab] = useState('services');

  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: '',
    duration: '',
    description: '',
    imageUrl: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItemWithId = { ...newItem, id: Date.now() };
    
    if (activeTab === 'services') {
      setServices([...services, newItemWithId]);
    } else {
      setNailDesigns([...nailDesigns, newItemWithId]);
    }
    
    setNewItem({
      name: '',
      price: '',
      category: '',
      duration: '',
      description: '',
      imageUrl: ''
    });
  };

  const handleDelete = (id) => {
    if (activeTab === 'services') {
      setServices(services.filter(item => item.id !== id));
    } else {
      setNailDesigns(nailDesigns.filter(item => item.id !== id));
    }
  };

  const handleLogout = () => navigate('/');
  const handleHome = () => navigate('/home');
  const handleArtist = () => navigate('/artist');
  const handleWaitlist = () => navigate('/waitlist');

  return (
    <div className="store-container">
      {/* Sidebar */}
      <div 
        className={`sidebar ${showSidebar ? 'expanded' : ''}`}
        onMouseEnter={() => setShowSidebar(true)}
        onMouseLeave={() => setShowSidebar(false)}
      >
        <div className="logo-container">
          <h1 className="logo">{showSidebar ? 'INBS' : 'IB'}</h1>
        </div>

        <div className="sidebar-buttons">
          <button className="sidebar-button" onClick={handleHome}>
            <span className="button-icon" style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>🏠</span>
            {showSidebar && 'Home'}
          </button>

          <button className="sidebar-button" onClick={handleArtist}>
            <span className="button-icon" style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>🎨</span>
            {showSidebar && 'Artist'}
          </button>

          <button className="sidebar-button" onClick={handleWaitlist}>
            <span className="button-icon" style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>⏳</span>
            {showSidebar && 'Waitlist'}
          </button>

          <button className="sidebar-button" onClick={handleLogout}>
            <span className="button-icon" style={{marginRight: "12px", marginLeft: "-12px", fontSize: "20px"}}>⬅️</span>
            {showSidebar && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${showSidebar ? 'sidebar-expanded' : ''}`}>
        <div className="header">
          <h1 className="page-title">Services & Nail Designs Management</h1>
        </div>

        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Nail Services
          </button>
          <button 
            className={`tab-button ${activeTab === 'designs' ? 'active' : ''}`}
            onClick={() => setActiveTab('designs')}
          >
            Nail Designs
          </button>
        </div>

        <div className="product-form">
          <h2 className="section-title">
            {activeTab === 'services' ? 'Add New Service' : 'Add New Design'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                type="text"
                name="name"
                placeholder={activeTab === 'services' ? "Service name" : "Design name"}
                value={newItem.name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              <input
                type="number"
                name="price"
                placeholder="Price (VND)"
                value={newItem.price}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              <select
                name="category"
                value={newItem.category}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select category</option>
                {activeTab === 'services' ? (
                  <>
                    <option value="basic">Basic Nail</option>
                    <option value="gel">Gel Nail</option>
                    <option value="acrylic">Acrylic Nail</option>
                    <option value="care">Nail Care</option>
                  </>
                ) : (
                  <>
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                    <option value="art">Art</option>
                  </>
                )}
              </select>
              {activeTab === 'services' && (
                <input
                  type="number"
                  name="duration"
                  placeholder="Duration (minutes)"
                  value={newItem.duration}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              )}
              <input
                type="text"
                name="imageUrl"
                placeholder="Image URL"
                value={newItem.imageUrl}
                onChange={handleInputChange}
                className="form-input"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={newItem.description}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="submit-button">Add New</button>
          </form>
        </div>

        <div className="product-list">
          <h2 className="section-title">
            {activeTab === 'services' ? 'Services List' : 'Designs List'}
          </h2>
          <table className="product-table">
            <thead>
              <tr className="product-table-header">
                <th className="product-table-header-cell">Name</th>
                <th className="product-table-header-cell">Price</th>
                <th className="product-table-header-cell">Category</th>
                {activeTab === 'services' && (
                  <th className="product-table-header-cell">Duration</th>
                )}
                <th className="product-table-header-cell">Description</th>
                <th className="product-table-header-cell">Image</th>
                <th className="product-table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'services' ? services : nailDesigns).map((item) => (
                <tr key={item.id} className="product-table-row">
                  <td className="product-table-cell">{item.name}</td>
                  <td className="product-table-cell">{item.price}</td>
                  <td className="product-table-cell">{item.category}</td>
                  {activeTab === 'services' && (
                    <td className="product-table-cell">{item.duration}</td>
                  )}
                  <td className="product-table-cell">{item.description}</td>
                  <td className="product-table-cell">
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100px', height: '100px' }} />
                  </td>
                  <td className="product-table-cell">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Store;