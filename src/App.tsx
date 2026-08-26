/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { DeviceFrame } from './components/layout/DeviceFrame';

export default function App() {
  return (
    <AppProvider>
      <DeviceFrame />
    </AppProvider>
  );
}
