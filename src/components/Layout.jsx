import React from 'react';
import NavSidebar from './NavSidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex">
            <NavSidebar />
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
};

export default Layout;
