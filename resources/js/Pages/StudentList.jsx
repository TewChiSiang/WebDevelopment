import React, { useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { UserGroupIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircle } from 'lucide-react';

const StudentList = ({ students = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [markedAttendance, setMarkedAttendance] = useState(new Set());

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleAttendance = (studentId) => {
    const newMarkedAttendance = new Set(markedAttendance);
    if (newMarkedAttendance.has(studentId)) {
      newMarkedAttendance.delete(studentId);
    } else {
      newMarkedAttendance.add(studentId);
    }
    setMarkedAttendance(newMarkedAttendance);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toString().includes(searchTerm)
  );

  return (
    <Card className="tw-shadow-xl tw-rounded-xl tw-overflow-hidden">
      <Card.Body className="tw-p-8">
        {/* Header Section */}
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
          <div className="tw-flex tw-items-center tw-gap-2">
            <UserGroupIcon className="tw-w-6 tw-h-6 tw-text-blue-600" />
            <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-800">Students List</h2>
            <span className="tw-ml-2 tw-px-3 tw-py-1 tw-bg-blue-100 tw-text-blue-600 tw-rounded-full tw-text-sm tw-font-medium">
              {students.length} Students
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="tw-relative tw-mb-6">
          <MagnifyingGlassIcon className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-w-5 tw-h-5 tw-text-gray-400" />
          <Form.Control
            type="text"
            placeholder="Search by name or Student ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="tw-pl-10 tw-py-3 tw-box-border tw-w-full tw-rounded-xl tw-border-gray-200 focus:tw-border-blue-500 focus:tw-ring-2 focus:tw-ring-blue-300 tw-transition-all"
          />
           {searchTerm && (
            <XCircleIcon
              className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-w-5 tw-h-5 tw-text-gray-400 tw-cursor-pointer hover:tw-text-gray-600"
              onClick={clearSearch}
            />
          )}
        </div>

        {/* Students List */}
        <div className="tw-divide-y tw-divide-gray-100">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className="tw-flex tw-items-center tw-justify-between tw-py-4 hover:tw-bg-gray-50 tw-transition-colors tw-rounded-lg tw-px-4"
              >
                <div className="tw-flex tw-items-center tw-gap-4">
                  <div className="tw-text-gray-500 tw-font-semibold tw-text-lg">
                    {index + 1}
                  </div>
                  <div className="tw-pl-3">
                    <h3 className="tw-font-medium tw-text-gray-900">{student.name}</h3>
                    <p className="tw-text-sm tw-text-gray-500">ID: {student.student_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAttendance(student.id)}
                  className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-transition-colors ${markedAttendance.has(student.id)
                    ? 'tw-bg-green-100 tw-text-green-700'
                    : 'tw-bg-gray-100 tw-text-gray-600 hover:tw-bg-gray-200'
                    }`}
                >
                  <CheckCircle className={`tw-w-5 tw-h-5 ${markedAttendance.has(student.id)
                    ? 'tw-text-green-600'
                    : 'tw-text-gray-400'
                    }`} />
                  {markedAttendance.has(student.id) ? 'Marked' : 'Mark Attendance'}
                </button>
              </div>
            ))
          ) : (
            <div className="tw-text-center tw-py-8">
              <UserGroupIcon className="tw-w-12 tw-h-12 tw-text-gray-400 tw-mx-auto tw-mb-3" />
              <p className="tw-text-gray-500 tw-text-lg">
                {searchTerm ? 'No students found matching your search.' : 'No students enrolled in this course.'}
              </p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StudentList;