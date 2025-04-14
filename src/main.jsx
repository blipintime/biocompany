import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import CompoundList from './components/CompoundList'
import Dashboard from './components/Dashboard'
import CatchAll from './components/CatchAll'
import './index.css'

// Create a router instance
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <CompoundList />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "*",
        element: <CatchAll />,
      },
    ],
  },
])

// Use createRoot with React 19
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
) 