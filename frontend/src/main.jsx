import { createRoot } from 'react-dom/client'
import './app/index.css'
import App from './app/App'
import { store } from './app/auth.store'
import {Provider} from "react-redux"

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
