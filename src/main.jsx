import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/500-italic.css';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);
