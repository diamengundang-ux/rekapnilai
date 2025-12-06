import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Kode CSS Reset sederhana agar font lebih rapi (Inter Font)
const style = document.createElement('style');
style.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body { font-family: 'Inter', sans-serif; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
