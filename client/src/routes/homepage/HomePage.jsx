import { Link } from "react-router-dom";
import "./homepage.css";

const Homepage = () => {
  return (
    <div className="homepage">
      <div className="left">
        <h1>DeStress.AI</h1>
        <h2>Supercharge your creativity and productivity</h2>
        <h3>
          Your personal AI assistant designed to help you relax, focus, and
          achieve more. Get personalized support for managing stress, boosting
          creativity, and enhancing your daily workflow.
        </h3>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right">
        <img
          src="/banner.jpg"
          alt="AI Assistant Illustration"
          className="illustration"
        />
      </div>
    </div>
  );
};

export default Homepage;
