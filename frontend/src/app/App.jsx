import React from "react";

import AppRouter from "./app.routes.jsx";
import { useAuthInit } from "./../feature/auth/hook/useAuthInit.js";
import { Toaster } from "react-hot-toast";

const App = () => {
  useAuthInit();

  return (
    <>
      <Toaster position="top-right" />
      <AppRouter />
    </>
  );
};

export default App;