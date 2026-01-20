import { BrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import "./styles/dark.css";

function App() {
  return (
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );
}

export default App;
