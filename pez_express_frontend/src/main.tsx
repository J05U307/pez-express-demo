import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'  // ← agrega
import './index.css'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'

// Registra el SW; se actualiza automáticamente en segundo plano
registerSW({ immediate: true })                     // ← agrega

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HelmetProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </HelmetProvider>
    </StrictMode>,
)