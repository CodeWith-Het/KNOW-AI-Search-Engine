import React from 'react';
import { router } from './app.routes';
import { RouterProvider } from 'react-router-dom';
import { useAuthInit } from './../feature/auth/hook/useAuthInit.js';
import { Toaster } from 'react-hot-toast';

const App = () => {

  useAuthInit()

  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
