import React from 'react';
import { router } from './app.routes';
import { RouterProvider } from 'react-router-dom';
import { useAuthInit } from './../feature/auth/hook/useAuthInit.js';

const App = () => {

  useAuthInit()

  return (
    <RouterProvider  router={router} />
  )
}

export default App;
