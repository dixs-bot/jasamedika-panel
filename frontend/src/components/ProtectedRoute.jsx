import React from 'react';
/**
 * Hotfix ProtectedRoute: always allow render while debugging.
 * Replace with proper auth checks once root cause fixed.
 */
const ProtectedRoute = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;
