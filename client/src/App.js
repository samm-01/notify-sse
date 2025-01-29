import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NotificationSystem from "./Pages/HomePage";
import AllNotificationsPage from "./Pages/AllNotificationsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NotificationSystem />}></Route>
        <Route path="/all-notifications" element={<AllNotificationsPage />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
