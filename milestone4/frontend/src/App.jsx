import React, { useState } from "react";
import Layout from "./Components/Layout";
import Notification from "./Components/Notification";

import AddUser from "./pages/AddUser";
import DeleteUser from "./pages/DeleteUser";
import UpdateItem from "./pages/UpdateItem";
import UserReport from "./pages/UserReport";
import ActiveUsers from "./pages/ActiveUsers";

function App() {
  const [currentPage, setCurrentPage] = useState("AddUser");
  const [notification, setNotification] = useState({ type: "", message: "" });

  function handleNavigate(page) {
    setCurrentPage(page);
    setNotification({ type: "", message: "" });
  }

  let pageComponent;
  switch (currentPage) {
    case "Delete User":
      pageComponent = <DeleteUser />;
      break;
    case "Update Item":
      pageComponent = <UpdateItem />;
      break;
    case "User Report":
      pageComponent = <UserReport />;
      break;
    case "Active Users":
      pageComponent = <ActiveUsers />;
      break;
    case "Add User":
    default:
      pageComponent = <AddUser />;
  }


  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      <Notification type={notification.type} message={notification.message} />
      {pageComponent}
    </Layout>
  );
}

export default App;
