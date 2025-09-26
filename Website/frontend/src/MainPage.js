// MainPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

// Import images from src/assets
import beachImg from "./assets/beach.jpeg";
import tvImg from "./assets/tv.jpeg";
import baliImg from "./assets/bali.jpeg";
import manaliImg from "./assets/manali.jpeg";
import jdImg from "./assets/jD.jpeg";
import nImg from "./assets/n.jpeg";
import lonawanlaImg from "./assets/lonawanla.jpeg";

function MainPage() {
  const navigate = useNavigate();

  return (
    <>
    <button className="fixed-circle-btn">AI</button>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">Tripin</div>
        <ul className="nav-links">
          <li><a href="#">Destinations</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#">My Trips</a></li>
          <li><a href="#">Adventures</a></li>
          <li><a href="#">Cart</a></li>
          <li><a href="#">Friends</a></li>
          <li><a href="#">Photos</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${beachImg})` }}
      >
        <div className="hero-text">
          <h1>
            Discover Your Next <span>Adventure</span>
          </h1>
          <p>
            Explore breathtaking destinations, connect with fellow travelers, and create memories that last a lifetime.
          </p>
          <div className="hero-buttons">
              <button 
                className="btn-left" 
                onClick={() => window.location.href = './indexGame.html'}
              >
                Reward Run
              </button>
            <button
              className="btn-outline-left"
              onClick={() => navigate("/map")}
            >
              Group Maps
            </button>
          </div>
        </div>

        <div className="search-box">
          <input type="text" placeholder="Search destinations..." />
          <input type="date" />
          <input type="number" min="1" defaultValue="2" />
          <button>Search</button>
        </div>

        <div className="popular-tags">
          <span>Agra</span>
          <span>Rajasthan</span>
          <span>Mumbai</span>
          <span>Goa</span>
          <span>Banglore</span>
        </div>
      </section>

      {/* Destination Card */}
      <section className="destination">
        <div className="card">
          <img src={tvImg} alt="Thiruvananthauram" />
          <div className="card-content">
            <h2>
              Thiruvananthauram <span className="price">1899</span>
            </h2>
            <p className="location">Kerala</p>
            <p>
              Discover the perfect blend of traditional and modern Japan with temple visits, street food tours, and cutting-edge experiences...
            </p>
            <div className="tags">
              <span>Culture</span>
              <span>Food</span>
              <span>Technology</span>
            </div>
            <div className="card-footer">
              <span>6 days</span>
              <div>
                <button className="btn-outline">View Details</button>
                <button className="btn-fill">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="popular">
        <h2>Popular Destinations</h2>
        <p>
          Discover handpicked destinations around the world, curated by fellow travelers and local experts.
        </p>
        <div className="popular-grid">
          <div className="card">
            <img src={baliImg} alt="Bali" />
            <div className="card-content">
              <h3>
                Ubud <span className="price">1299</span>
              </h3>
              <p className="location">Bali, Indonesia</p>
              <p>⭐ 4.8 (324)</p>
            </div>
          </div>
          <div className="card">
            <img src={manaliImg} alt="Manali" />
            <div className="card-content">
              <h3>
                Manali <span className="price">2199</span>
              </h3>
              <p className="location">Manali</p>
              <p>⭐ 4.9 (412)</p>
            </div>
          </div>
        </div>
        <div className="center-btn">
          <button className="btn-fill">View All Destinations</button>
        </div>
      </section>

      {/* Profile Section */}
      <section className="profile">
        <div className="profile-header">
          <h2>Your Travel Profile</h2>
          <p>Track your adventures and connect with fellow travelers</p>
        </div>
        <div
          className="profile-card"
          style={{
            backgroundImage: `url(${jdImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="avatar">JD</div>
          <h3>Jethalal Gada</h3>
          <p>Adventure Enthusiast</p>
          <div className="badges">
            <span className="orange">Explorer</span>
            <span className="green">Nature Lover</span>
          </div>
          <button className="edit-btn">✎ Edit Profile</button>
        </div>

        <div className="stats">
          <div className="stat">
            <h3>23</h3>
            <p>Countries Visited</p>
          </div>
          <div className="stat">
            <h3>47</h3>
            <p>Adventures Completed</p>
          </div>
          <div className="stat">
            <h3>156</h3>
            <p>Photos Shared</p>
          </div>
          <div className="stat">
            <h3>5</h3>
            <p>Years Traveling</p>
          </div>
        </div>
      </section>

      {/* Memories */}
      <section className="memories">
        <h2>Travel Memories</h2>
        <p>Share your favorite travel moments with the community</p>
        <button className="btn-fill">📷 Upload Photo</button>

        <div className="memories-grid">
          <div className="memory-card">
            <img src={nImg} alt="Morning yoga" />
            <div className="content">
              <p className="location">Kashmir, India</p>
              <p>Morning yoga at the rice terraces</p>
              <div className="actions">
                <span>❤️ 42</span>
                <span>💬 8</span>
              </div>
            </div>
          </div>

          <div className="memory-card">
            <img src={lonawanlaImg} alt="Sunset Oia" />
            <div className="content">
              <p className="location">Tiger Point, Lonavala</p>
              <p>Sunset from Tiger Lonaval never gets old ✨</p>
              <div className="actions">
                <span>❤️ 89</span>
                <span>💬 15</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default MainPage;
