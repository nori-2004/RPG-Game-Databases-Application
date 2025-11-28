import React, { useState } from "react";
import Layout from "./Components/Layout";
import Notification from "./Components/Notification";
import AddUser from "./pages/AddUser";

function App() {
  const [currentPage, setCurrentPage] = useState("AddUser");
  const [notification, setNotification] = useState({ type: "", message: "" });

  function handleNavigate(page) {
    setCurrentPage(page);
    setNotification({ type: "", message: "" });
  }

  let pageComponent = <AddUser />;

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      <Notification type={notification.type} message={notification.message} />
      {pageComponent}
    </Layout>
  );
}

export default App;
