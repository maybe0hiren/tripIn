import React, { useState, useRef, useEffect } from "react";
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

// Insert your Gemini API key here
const GEMINI_API_KEY = "AIzaSyC1Nh77oGnHAnarfg_jNu_ommGrj5NwQuk";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

// Kerala Tourist spots data
const sampleData = [
  {
    city: "Alleppey, Kerala",
    description: "Famous for its backwaters, houseboats, and serene canals.",
    images: ["alleppey1.jpg", "alleppey2.jpg"],
    locationName: "Alleppey Backwaters",
    notes: "Best visited during monsoon season for lush green views.",
    status: "approved"
  },
  {
    city: "Munnar, Kerala",
    description: "Hill station known for tea plantations and cool climate.",
    images: ["munnar1.jpg", "munnar2.jpg"],
    locationName: "Munnar Tea Gardens",
    notes: "Great for trekking and photography.",
    status: "approved"
  },
  {
    city: "Kochi, Kerala",
    description: "Historic port city with colonial architecture and vibrant culture.",
    images: ["kochi1.jpg", "kochi2.jpg"],
    locationName: "Fort Kochi",
    notes: "Famous for Chinese fishing nets and spice markets.",
    status: "approved"
  },
  {
    city: "Kumarakom, Kerala",
    description: "Village on Vembanad Lake famous for bird sanctuary and backwaters.",
    images: ["kumarakom1.jpg", "kumarakom2.jpg"],
    locationName: "Kumarakom Bird Sanctuary",
    notes: "Ideal for birdwatchers and peaceful boat rides.",
    status: "approved"
  },
  {
    city: "Wayanad, Kerala",
    description: "Hill district known for wildlife sanctuaries and waterfalls.",
    images: ["wayanad1.jpg", "wayanad2.jpg"],
    locationName: "Edakkal Caves",
    notes: "Ancient petroglyphs, good for history enthusiasts.",
    status: "approved"
  },
  {
    city: "Thekkady, Kerala",
    description: "Home to Periyar Wildlife Sanctuary with elephants and tigers.",
    images: ["thekkady1.jpg", "thekkady2.jpg"],
    locationName: "Periyar Tiger Reserve",
    notes: "Famous for boat safaris and spice plantations.",
    status: "approved"
  },
  {
    city: "Kovalam, Kerala",
    description: "Popular beach destination with lighthouse and calm waters.",
    images: ["kovalam1.jpg", "kovalam2.jpg"],
    locationName: "Kovalam Beach",
    notes: "Ideal for sunbathing, swimming, and Ayurvedic massages.",
    status: "approved"
  },
  {
    city: "Varkala, Kerala",
    description: "Cliff-side beach town with scenic sunsets and mineral springs.",
    images: ["varkala1.jpg", "varkala2.jpg"],
    locationName: "Varkala Beach",
    notes: "Cliffs overlook the Arabian Sea; perfect for photography.",
    status: "approved"
  },
  {
    city: "Bekal, Kerala",
    description: "Known for historic fort and long scenic beach.",
    images: ["bekal1.jpg", "bekal2.jpg"],
    locationName: "Bekal Fort",
    notes: "Famous for beach views and sunset photography.",
    status: "approved"
  },
  {
    city: "Thrissur, Kerala",
    description: "Cultural capital of Kerala, famous for festivals.",
    images: ["thrissur1.jpg", "thrissur2.jpg"],
    locationName: "Vadakkunnathan Temple",
    notes: "Main attraction during Thrissur Pooram festival.",
    status: "approved"
  },
  {
    city: "Guruvayur, Kerala",
    description: "Pilgrimage town famous for ancient Krishna temple.",
    images: ["guruvayur1.jpg", "guruvayur2.jpg"],
    locationName: "Guruvayur Temple",
    notes: "Must-visit for devotees; strict dress code applies.",
    status: "approved"
  },
  {
    city: "Athirappilly, Kerala",
    description: "Spectacular waterfalls known as ‘Niagara of India’.",
    images: ["athirappilly1.jpg", "athirappilly2.jpg"],
    locationName: "Athirappilly Waterfalls",
    notes: "Best during monsoon; popular for movies shoots.",
    status: "approved"
  },
  {
    city: "Punalur, Kerala",
    description: "Town famous for scenic bridges and nearby hills.",
    images: ["punalur1.jpg", "punalur2.jpg"],
    locationName: "Punalur Suspension Bridge",
    notes: "Historic bridge surrounded by lush greenery.",
    status: "approved"
  },
  {
    city: "Idukki, Kerala",
    description: "Hill district with dams, valleys, and wildlife.",
    images: ["idukki1.jpg", "idukki2.jpg"],
    locationName: "Idukki Dam",
    notes: "One of the highest arch dams in Asia; picturesque views.",
    status: "approved"
  },
  {
    city: "Alappuzha, Kerala",
    description: "Also known as Alleppey, famous for backwaters and coir industry.",
    images: ["alappuzha1.jpg", "alappuzha2.jpg"],
    locationName: "Alappuzha Houseboats",
    notes: "Experience overnight cruises through tranquil backwaters.",
    status: "approved"
  },
  {
    city: "Malappuram, Kerala",
    description: "District known for historic mosques and hills.",
    images: ["malappuram1.jpg", "malappuram2.jpg"],
    locationName: "Kottakkunnu",
    notes: "Hilltop park with panoramic city views.",
    status: "approved"
  },
  {
    city: "Kanhangad, Kerala",
    description: "Coastal town with historic forts and beaches.",
    images: ["kanhangad1.jpg", "kanhangad2.jpg"],
    locationName: "Hosdurg Fort",
    notes: "Historic fort near the Arabian Sea; photography spot.",
    status: "approved"
  },
  {
    city: "Kasargod, Kerala",
    description: "Northern Kerala town with forts and beaches.",
    images: ["kasargod1.jpg", "kasargod2.jpg"],
    locationName: "Bekal Beach",
    notes: "Adjacent to Bekal Fort; less crowded beaches.",
    status: "approved"
  },
  {
    city: "Thrippunithura, Kerala",
    description: "Suburb of Kochi with royal heritage.",
    images: ["thrippunithura1.jpg", "thrippunithura2.jpg"],
    locationName: "Hill Palace",
    notes: "Former royal palace, museum with artifacts.",
    status: "approved"
  },
  {
    city: "Changanassery, Kerala",
    description: "Town with educational institutions and temples.",
    images: ["changanassery1.jpg", "changanassery2.jpg"],
    locationName: "St. Mary’s Church",
    notes: "Historic church with colonial architecture.",
    status: "approved"
  }
];


function findLocationData(query) {
  query = query.toLowerCase();
  return sampleData.find(
    (loc) =>
      loc.city.toLowerCase().includes(query) ||
      loc.locationName.toLowerCase().includes(query)
  );
}

function MainPage() {
  const navigate = useNavigate();

  // Chatbot state
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Gemini API call helper
  async function getGeminiReply(userText) {
    const systemPrompt = "You are a friendly AI travel assistant.";
    const userQuery = `User said: "${userText}" Please reply simply and helpfully.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Gemini API returned error: " + response.status);
      }
      const data = await response.json();
      const generatedMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedMessage) {
        return generatedMessage;
      } else {
        throw new Error("No message generated by Gemini.");
      }
    } catch (error) {
      console.error(error);
      return "Sorry, I’m having trouble responding right now. Please try again later.";
    }
  }

  // Send message handler integrates local data & Gemini API fallback
  const sendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || isLoading) return;

    setChatMessages((prev) => [...prev, { sender: "You", text: msg }]);
    setChatInput("");
    setIsLoading(true);

    // Try to find matching Kerala location info for data-driven reply
    const locationInfo = findLocationData(msg);

    let botReply;
    if (locationInfo) {
      botReply = `🌟 Here’s info about ${locationInfo.locationName} (${locationInfo.city}):\n` +
                 `${locationInfo.description}\n` +
                 `Note: ${locationInfo.notes}`;
    } else {
      // Fallback to Gemini AI generated reply
      botReply = await getGeminiReply(msg);
    }

    setChatMessages((prev) => [...prev, { sender: "Bot", text: botReply }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <button
        className="fixed-circle-btn"
        onClick={() => setShowChatbot((prev) => !prev)}
        aria-label="Toggle AI chatbot"
      >
        AI
      </button>

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
      <section className="hero" style={{ backgroundImage: `url(${beachImg})` }}>
        <div className="hero-text">
          <h1>Discover Your Next <span>Adventure</span></h1>
          <p>Explore breathtaking destinations, connect with fellow travelers, and create memories that last a lifetime.</p>
          <div className="hero-buttons">
            <button className="btn-left" onClick={() => (window.location.href = "./indexGame.html")}>Reward Run</button>
            <button className="btn-outline-left" onClick={() => navigate("/map")}>Group Maps</button>
          </div>
        </div>

        <div className="search-box">
          <input type="text" placeholder="Search destinations..." />
          <input type="date" />
          <input type="number" min="1" defaultValue="2" />
          <button>Search</button>
        </div>

        <div className="popular-tags">
          <span>Agra</span><span>Rajasthan</span><span>Mumbai</span><span>Goa</span><span>Banglore</span>
        </div>
      </section>

      {/* Destination Card */}
      <section className="destination">
        <div className="card">
          <img src={tvImg} alt="Thiruvananthauram" />
          <div className="card-content">
            <h2>Thiruvananthauram <span className="price">1899</span></h2>
            <p className="location">Kerala</p>
            <p>Discover the perfect blend of traditional and modern Japan with temple visits, street food tours, and cutting-edge experiences...</p>
            <div className="tags"><span>Culture</span><span>Food</span><span>Technology</span></div>
            <div className="card-footer">
              <span>6 days</span>
              <div><button className="btn-outline">View Details</button><button className="btn-fill">Book Now</button></div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="popular">
        <h2>Popular Destinations</h2>
        <p>Discover handpicked destinations around the world, curated by fellow travelers and local experts.</p>
        <div className="popular-grid">
          <div className="card">
            <img src={baliImg} alt="Bali" />
            <div className="card-content">
              <h3>Ubud <span className="price">1299</span></h3>
              <p className="location">Bali, Indonesia</p>
              <p>⭐ 4.8 (324)</p>
            </div>
          </div>
          <div className="card">
            <img src={manaliImg} alt="Manali" />
            <div className="card-content">
              <h3>Manali <span className="price">2199</span></h3>
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
        <div className="profile-card" style={{ backgroundImage: `url(${jdImg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="avatar">JD</div>
          <h3>Jethalal Gada</h3>
          <p>Adventure Enthusiast</p>
          <div className="badges"><span className="orange">Explorer</span><span className="green">Nature Lover</span></div>
          <button className="edit-btn">✎ Edit Profile</button>
        </div>
        <div className="stats">
          <div className="stat"><h3>23</h3><p>Countries Visited</p></div>
          <div className="stat"><h3>47</h3><p>Adventures Completed</p></div>
          <div className="stat"><h3>156</h3><p>Photos Shared</p></div>
          <div className="stat"><h3>5</h3><p>Years Traveling</p></div>
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
              <div className="actions"><span>❤️ 42</span><span>💬 8</span></div>
            </div>
          </div>

          <div className="memory-card">
            <img src={lonawanlaImg} alt="Sunset Oia" />
            <div className="content">
              <p className="location">Tiger Point, Lonavala</p>
              <p>Sunset from Tiger Lonaval never gets old ✨</p>
              <div className="actions"><span>❤️ 89</span><span>💬 15</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot Popup */}
      {showChatbot && (
        <div id="chatbot-popup" className="chatbot-popup" role="dialog" aria-modal="true" aria-labelledby="chatbot-title">
          <div id="chatbot-popup-header" className="chatbot-popup-header">
            <span id="chatbot-title">AI Chatbot</span>
            <span className="close-chat-popup" onClick={() => setShowChatbot(false)} role="button" tabIndex={0} onKeyDown={(e) => {if(e.key==="Enter") setShowChatbot(false);}} aria-label="Close chatbot">✖</span>
          </div>
          <div id="chatbot-popup-messages" className="chatbot-popup-messages" aria-live="polite">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender === "You" ? "user-msg" : "bot-msg"}`} aria-label={`${msg.sender} message`}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div id="chatbot-popup-input" className="chatbot-popup-input">
            <input
              type="text"
              id="chatbot-input-text"
              placeholder={isLoading ? "Waiting for reply..." : "Type a message..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              aria-label="Chat message input"
              disabled={isLoading}
              autoFocus
            />
            <button id="chatbot-send-btn" onClick={sendMessage} aria-label="Send message" disabled={isLoading}>
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MainPage;
