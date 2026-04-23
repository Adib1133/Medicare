import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center px-4">
        <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
        >
          <i className="fas fa-home mr-2"></i>
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;