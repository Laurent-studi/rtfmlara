'use client';

import React from 'react';
import ToastContainer from '../components/ToastContainer';

interface AppProviderProps {
  children: React.ReactNode;
}

export class AppProvider extends React.Component<AppProviderProps> {
  render() {
    return (
      <ToastContainer>
        {this.props.children}
      </ToastContainer>
    );
  }
}

export default AppProvider; 