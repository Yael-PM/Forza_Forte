/** Punto de entrada: monta la aplicación y define sus rutas. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

// PAGES
import Landing from './pages/Landing'
import Materials from './pages/Materials'
import Collection from './pages/Collection'
import Design from './pages/Design'
import Editor from './pages/Editor'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/materials',
    element: <Materials />,
  },
  {
    path: '/collection',
    element: <Collection />,
  },
  {
    path: '/design',
    element: <Design />,
  },
  {
    path: '/editor',
    element: <Editor />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
