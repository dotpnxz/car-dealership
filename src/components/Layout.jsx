import React, { useState } from 'react';
import NavSidebar from './NavSidebar';

// Add isCollapsed state and pass as props to NavSidebar
const Layout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex">
            <NavSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
