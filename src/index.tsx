import type {ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider} from 'react-redux';

import {ConfigProvider, theme} from 'antd';
import 'antd/dist/reset.css';

import 'allotment/dist/style.css';
import isPropValid from '@emotion/is-prop-valid';
import log from 'loglevel';
import {machineIdSync} from 'node-machine-id';
import {StyleSheetManager} from 'styled-components';

import '@redux/ipcRendererRedux';
import store from '@redux/store';
import '@redux/storeListeners';

import {ErrorPage} from '@components/organisms/ErrorPage/ErrorPage';

import {ignoreKnownErrors} from '@utils/knownErrors';

import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

declare global {
  interface Window {
    debug_logs: (value: boolean) => void;
    get_machine_id: () => string;
  }
}

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  log.enableAll();
  log.debug('Enabled all log levels');
}

window.debug_logs = (value: boolean) => {
  if (value) {
    log.enableAll();
    log.debug('Enabled all log levels');
  } else {
    log.disableAll();
    log.debug('Disabled all log levels');
  }
};

window.get_machine_id = () => {
  const machineId = machineIdSync();
  return machineId;
};

ignoreKnownErrors();

function RendererProviders({children}: {children: ReactNode}) {
  return (
    <StyleSheetManager shouldForwardProp={(prop, target) => typeof target !== 'string' || isPropValid(prop)}>
      <ConfigProvider theme={{algorithm: theme.darkAlgorithm, token: {colorPrimary: '#177ddc', borderRadius: 4}}}>
        {children}
      </ConfigProvider>
    </StyleSheetManager>
  );
}

ConfigProvider.config({holderRender: children => <RendererProviders>{children}</RendererProviders>});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Application root element is missing');
}

createRoot(rootElement).render(
  <Provider store={store}>
    <RendererProviders>
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <App />
      </ErrorBoundary>
    </RendererProviders>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
