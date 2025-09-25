import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  const goToMap = () => {
    navigate("/map");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Real-Time Location Sharing</h1>
      <button onClick={goToMap} style={{ fontSize: "20px", padding: "10px 20px" }}>
        Go to Map
      </button>
    </div>
  );
};

export default MainPage;
