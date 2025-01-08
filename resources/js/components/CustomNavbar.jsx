import React, { useState } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { FaUserGraduate } from "react-icons/fa";
import { Inertia } from '@inertiajs/inertia';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const CustomNavbar = ({ userRole, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    Inertia.post('/logout');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="tw-bg-white tw-shadow-md tw-sticky tw-top-0 tw-z-50">
      <div className="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <div className="tw-flex tw-justify-between tw-h-16">
          {/* Logo and Brand */}
          <div className="tw-flex tw-items-center">
            <a href="/" className="tw-flex tw-items-center tw-no-underline">
              <AcademicCapIcon className="tw-w-10 tw-h-10 tw-text-blue-600 tw-mr-3" />
              <span className="tw-ml-2 tw-text-2xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent">
                AttendEZ
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="tw-hidden md:tw-flex md:tw-items-center md:tw-space-x-4">
            <div className="tw-relative">
              <button
                onClick={toggleDropdown}
                className="tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-text-blue-600 tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors tw-duration-150"
              >
                {userRole === 'student' ? (
                  <User className="tw-w-5 tw-h-5 tw-mr-2" />
                ) : (
                  <FaUserGraduate className="tw-w-4 tw-h-4 tw-mr-2" />
                )}
                <span className="tw-mr-1">{user.name}</span>
                <ChevronDown className="tw-w-4 tw-h-4" />
              </button>

              {/* Desktop Dropdown Menu */}
              {showDropdown && (
                <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-48 tw-bg-white tw-rounded-lg tw-shadow-lg tw-py-1 tw-z-50">
                  <a
                    href={userRole === 'student' ? '/student-profile' : '/lecture-profile'}
                    className="tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-bg-gray-50 tw-no-underline"
                  >
                    {userRole === 'student' ? (
                      <User className="tw-w-5 tw-h-5 tw-mr-2" />
                    ) : (
                      <FaUserGraduate className="tw-w-4 tw-h-4 tw-mr-2" />
                    )}
                    Profile
                  </a>
                  <div className="tw-border-t tw-border-gray-100"></div>
                  <a
                    onClick={handleLogout}
                    className="tw-flex tw-items-center tw-w-full tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-bg-gray-50 tw-no-underline tw-cursor-pointer"
                  >
                    <LogOut className="tw-w-4 tw-h-4 tw-mr-2" />
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:tw-hidden tw-flex tw-items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="tw-p-2 tw-rounded-md tw-text-gray-700 hover:tw-text-blue-600 hover:tw-bg-gray-50 focus:tw-outline-none"
            >
              {isOpen ? (
                <X className="tw-w-6 tw-h-6" />
              ) : (
                <Menu className="tw-w-6 tw-h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:tw-hidden">
          <div className="tw-px-2 tw-pt-2 tw-pb-3 tw-space-y-1">
            <div className="tw-flex tw-flex-col tw-space-y-2">
              <a
               href={userRole === 'student' ? '/student-profile' : '/lecture-profile'}
                className="tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-bg-gray-50 tw-rounded-lg tw-no-underline"
              >
                <User className="tw-w-5 tw-h-5 tw-mr-2" />
                Profile
              </a>
              <a
                onClick={handleLogout}
                className="tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-bg-gray-50 tw-rounded-lg tw-no-underline"
              >
                <LogOut className="tw-w-5 tw-h-5 tw-mr-2" />
                Logout
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for dropdown */}
      {showDropdown && (
        <div
          className="tw-fixed tw-inset-0 tw-z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
};

export default CustomNavbar;
