import { createRoot } from 'react-dom/client';
import { Provider } from 'jotai';
import 'virtual:uno.css';
import '@/styles/loader.scss';
import '@/styles/app.scss';
import '@/i18n';
import '@/audio/music';
import App from './App';
import { gameStore, subscribePersistence } from '@/state/store';
import { bindKeyboard } from '@/input/keyboard';
import { bindVisibility } from '@/input/visibility';
import { installE2EHooks } from '@/test-hooks/e2e';

subscribePersistence();
bindKeyboard();
bindVisibility();
installE2EHooks();

createRoot(document.getElementById('root')!).render(
  <Provider store={gameStore}>
    <App />
  </Provider>,
);
