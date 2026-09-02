import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router";
import Pics from './pics';
import MainPage from './mainPage';
import { Provider } from 'react-redux';
import { store } from './store';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainPage />,
    },
    {
      path: "/pics",
      element: <Pics />,
    },
  ],
  {
    basename: "/react17test", // 這樣才是正確的第二個參數設定物件
  }
);

// 2. Render the RouterProvider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
