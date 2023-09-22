import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarStatus, setSidebarStatus] = useState('');
  const [sidebarContent, setSidebarContent] = useState();

  const toggleSidebar = () => setIsOpen((io) => !io);

  const openSidebar = ({ content, status = '' }) => {
    setSidebarContent(content);
    setSidebarStatus(status);
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setSidebarContent();
    setSidebarStatus('');
    setIsOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        sidebarStatus,
        sidebarContent,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  children: PropTypes.node,
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    console.log('SidebarProvider not defined!');
  } else {
    return context;
  }
};
