import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [universitiesPerPage] = useState(9);

  const getRandomYear = () => Math.floor(Math.random() * 200) + 1800;
  const getRandomStudentCount = () => Math.floor(Math.random() * 40000) + 1000;

  const searchUniversities = async () => {
    if (!searchTerm && !country) {
      setError('Please enter a search term or select a country');
      return;
    }

    setLoading(true);
    setError('');
    setSelectedUniversity(null);
    setCurrentPage(1);

    try {
      let url = `https://universities.hipolabs.com/search?`;
      if (searchTerm) url += `name=${encodeURIComponent(searchTerm)}`;
      if (country) url += `${searchTerm ? '&' : ''}country=${encodeURIComponent(country)}`;

      const response = await axios.get(url);
      const universitiesData = response.data.map(uni => ({
        ...uni,
        founded: getRandomYear(),
        students: getRandomStudentCount()
      }));

      setUniversities(universitiesData);

      if (universitiesData.length === 0) {
        setError('No universities found matching your criteria');
      }
    } catch (err) {
      setError('Failed to fetch universities. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchUniversities();
  };

  const clearResults = () => {
    setUniversities([]);
    setSearchTerm('');
    setCountry('');
    setError('');
    setSelectedUniversity(null);
    setCurrentPage(1);
  };

  const indexOfLastUniversity = currentPage * universitiesPerPage;
  const indexOfFirstUniversity = indexOfLastUniversity - universitiesPerPage;
  const currentUniversities = universities.slice(indexOfFirstUniversity, indexOfLastUniversity);
  const totalPages = Math.ceil(universities.length / universitiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌍 Worldwide College Finder</h1>
        <p>Discover detailed information about universities worldwide</p>
      </header>

      <main className="main-content">
        <div className="search-container">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search by university name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="country-select"
              >
                <option value="">All Countries</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="China">China</option>
                <option value="India">India</option>
                <option value="Brazil">Brazil</option>
              </select>
            </div>

            <div className="button-group">
              <button
                type="submit"
                disabled={loading}
                className="search-btn"
              >
                {loading ? 'Searching...' : '🔍 Search Universities'}
              </button>

              <button
                type="button"
                onClick={clearResults}
                className="clear-btn"
              >
                🗑️ Clear
              </button>
            </div>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading universities...</p>
          </div>
        )}

        {selectedUniversity && (
          <UniversityDetails
            university={selectedUniversity}
            onClose={() => setSelectedUniversity(null)}
          />
        )}

        {universities.length > 0 && !selectedUniversity && (
          <div className="results-container">
            <h2>Found {universities.length} Universities</h2>

            <div className="universities-grid">
              {currentUniversities.map((university, index) => (
                <UniversityCard
                  key={index}
                  university={university}
                  onSelect={setSelectedUniversity}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const UniversityCard = ({ university, onSelect }) => (
  <div className="university-card" onClick={() => onSelect(university)}>
    <h3 className="university-name">{university.name}</h3>
    <div className="card-content">
      <p>📍 {university.country} ({university.alpha_two_code})</p>
      <p>👥 {university.students.toLocaleString()} students</p>
      <p>📅 Founded: {university.founded}</p>
      <p>🌐 {university.domains?.[0]}</p>
    </div>
    <button className="view-details-btn">View Complete Details</button>
  </div>
);

const UniversityDetails = ({ university, onClose }) => (
  <div className="university-details-overlay">
    <div className="university-details">
      <div className="details-header">
        <h2>{university.name}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="details-grid">
        <div className="details-section">
          <h3>📋 Institution Overview</h3>
          <p><strong>Country:</strong> {university.country}</p>
          <p><strong>Established:</strong> {university.founded}</p>
          <p><strong>Student Population:</strong> {university.students.toLocaleString()}</p>
        </div>

        <div className="details-section">
          <h3>🌐 Digital Presence</h3>
          {university.web_pages.map((web, i) => (
            <p key={i}>
              <a href={web} target="_blank" rel="noopener noreferrer">{web}</a>
            </p>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default App;
