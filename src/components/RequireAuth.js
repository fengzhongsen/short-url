import React from "react";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return null;
  }
  return children;
}

export default RequireAuth;
