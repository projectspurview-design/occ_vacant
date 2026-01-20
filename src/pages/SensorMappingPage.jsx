import { useNavigate } from "react-router-dom";
import SensorForm from "../components/sensors/SensorForm";

export default function SensorMappingPage() {
  const navigate = useNavigate();

  return (
    <div className="page animated-bg">
      <div className="card">
        <h2>Map Sensor</h2>
        <p className="subtitle">Assign a friendly name to a sensor MAC address</p>

        <SensorForm />

        {/* Next button */}
        <button
          style={{ marginTop: "16px" }}
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}
