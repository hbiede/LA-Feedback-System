/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React from 'react';
import ReactDOM from 'react-dom';

import { api } from 'redux/modules';

import App from './App';

api.getState().startUp();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
