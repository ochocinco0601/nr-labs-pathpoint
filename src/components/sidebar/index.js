import React from 'react';

import { useSidebar } from '../../contexts';

import { Button } from 'nr1';

const Sidebar = () => {
  const {
    isOpen,
    closeSidebar,
    sidebarStatus = '',
    sidebarContent,
  } = useSidebar();

  return (
    <div className={`sidebar ${!isOpen ? 'closed' : ''} ${sidebarStatus}`}>
      <div className="header">
        <Button
          type={Button.TYPE.PLAIN}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__CLOSE}
          onClick={closeSidebar}
        />
      </div>
      <div className="content">{sidebarContent}</div>
    </div>
  );
};

export default Sidebar;
