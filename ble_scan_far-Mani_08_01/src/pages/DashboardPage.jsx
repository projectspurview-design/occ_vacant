// src/pages/DashboardPage.jsx
import SensorTable from "../components/sensors/SensorTable";
import logo from "../assets/Jpmco.png";

export default function DashboardPage() {
  return (
    <div className="dash-bg">
      {/* HEADER */}
      <header className="dash-header">
        <div className="dash-header-side" />
        <div className="dash-header-center">
          <img src={logo} alt="JPM" className="dash-logo" />
        </div>
        <div className="dash-header-side" />
      </header>

      {/* CONTENT */}
      <main className="dash-content">
        <div className="dash-container">
          <SensorTable />
        </div>
      </main>
    </div>
  );
}
