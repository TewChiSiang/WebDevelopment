import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Form, Modal } from 'react-bootstrap';
import { UserGroupIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { CircleCheck, Clock, CircleX } from 'lucide-react';
import { FaTrashAlt } from 'react-icons/fa';
import Button from '@mui/material/Button';
import axios from 'axios';
import debounce from 'lodash/debounce';

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent'
};

const DIALOG_TYPES = {
  MARK: 'mark',
  DELETE: 'delete'
};

const STATUS_STYLES = {
  [ATTENDANCE_STATUS.PRESENT]: {
    className: 'tw-bg-green-100 tw-text-green-700',
    icon: (props) => <CircleCheck {...props} className="tw-w-5 tw-h-5 tw-text-green-600" />,
    text: 'Present'
  },
  [ATTENDANCE_STATUS.LATE]: {
    className: 'tw-bg-yellow-100 tw-text-yellow-700',
    icon: (props) => <Clock {...props} className="tw-w-5 tw-h-5 tw-text-yellow-600" />,
    text: 'Late'
  },
  [ATTENDANCE_STATUS.ABSENT]: {
    className: 'tw-bg-gray-100 tw-text-gray-600 hover:tw-bg-gray-200 tw-cursor-pointer',
    icon: (props) => <CircleX {...props} className="tw-w-5 tw-h-5 tw-text-gray-400" />,
    text: 'Absent'
  }
};

const StudentList = ({ students = [], courseId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Memoized Values
  const storageKey = useMemo(() => `attendanceStatus_${courseId}`, [courseId]);


  const getAttendanceInfo = useCallback((studentId) => {
    const info = attendanceStatus[studentId];
    if (!info) {
      return {
        status: ATTENDANCE_STATUS.ABSENT,
        checkInTime: null
      };
    }
    return {
      status: info.status,
      checkInTime: info.check_in_time
    };
  }, [attendanceStatus]);

  const getStatusCounts = useMemo(() => {
    const counts = {
      [ATTENDANCE_STATUS.PRESENT]: 0,
      [ATTENDANCE_STATUS.LATE]: 0,
      [ATTENDANCE_STATUS.ABSENT]: 0
    };

    students.forEach(student => {
      const status = getAttendanceInfo(student.id).status;
      counts[status]++;
    });

    return counts;
  }, [students, attendanceStatus]);

  const filterStudents = useCallback((term, statusFilter) => {
    let filtered = students;

    if (term) {
      const searchTermLower = term.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTermLower) ||
        student.student_id.toString().toLowerCase().includes(searchTermLower)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(student => {
        const studentStatus = getAttendanceInfo(student.id).status;
        return studentStatus === statusFilter;
      });
    }

    return filtered;
  }, [students, getAttendanceInfo]);

  const loadStoredAttendance = useCallback(() => {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return;

    try {
      const { date, data } = JSON.parse(storedData);
      const storedDate = new Date(date).toDateString();
      const today = new Date().toDateString();

      if (storedDate === today) {
        setAttendanceStatus(data);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Error loading stored attendance:', error);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const fetchAttendanceStatus = useCallback(async () => {
    if (!courseId) return;

    try {
      const response = await axios.get(`/api/attendance-status/course/${courseId}`);
      const newAttendanceStatus = response.data;

      localStorage.removeItem(storageKey);
      setAttendanceStatus(newAttendanceStatus);
      localStorage.setItem(storageKey, JSON.stringify({
        date: new Date().toISOString(),
        data: newAttendanceStatus
      }));
    } catch (error) {
      console.error('Error fetching attendance status:', error.response?.data || error.message);
    }
  }, [courseId, storageKey]);

  // Event Handlers
  const handleStatusClick = (student) => {
    const hasAttendance = Boolean(attendanceStatus[student.id]);
    if (!hasAttendance) {
      setSelectedStudent(student);
      setDialogType(DIALOG_TYPES.MARK);
      setDialogOpen(true);
    }
  };

  const handleDeleteClick = (student, e) => {
    e.stopPropagation();
    setSelectedStudent(student);
    setDialogType(DIALOG_TYPES.DELETE);
    setDialogOpen(true);
  };

  const handleManualAttendance = async () => {
    try {
      const response = await axios.post(`/manual-attendance/${courseId}`, {
        studentId: selectedStudent.id,
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        const newStatus = {
          status: response.data.status,
          check_in_time: response.data.check_in_time
        };

        setAttendanceStatus(prev => {
          const updated = {
            ...prev,
            [selectedStudent.id]: newStatus
          };

          localStorage.setItem(storageKey, JSON.stringify({
            date: new Date().toISOString(),
            data: updated
          }));

          return updated;
        });

        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
    setDialogOpen(false);
  };

  const handleDeleteAttendance = async () => {
    try {
      const response = await axios.delete(`/attendance/${courseId}/${selectedStudent.id}`);

      if (response.data.success) {
        localStorage.removeItem(storageKey);
        setAttendanceStatus({});
        localStorage.setItem('attendanceUpdate', JSON.stringify({
          type: 'delete',
          studentId: selectedStudent.id,
          timestamp: Date.now(),
        }));
        fetchAttendanceStatus();
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
    }
    setDialogOpen(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
    setDialogType(null);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const renderStatusInfo = useCallback(({ status, checkInTime, student }) => {
    const statusConfig = STATUS_STYLES[status];
    const hasAttendance = status !== ATTENDANCE_STATUS.ABSENT;

    return (
      <div className="tw-flex tw-items-center tw-gap-2">
        <div
          className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-transition-colors ${statusConfig.className} ${status === ATTENDANCE_STATUS.ABSENT ? 'hover:tw-bg-gray-200 tw-cursor-pointer' : ''}`}
          onClick={() => handleStatusClick(student)}
        >
          {statusConfig.icon({})}
          <div className="tw-flex tw-flex-col">
            <span>{statusConfig.text}</span>
            {checkInTime && (
              <span className="tw-text-xs tw-opacity-75">
                {new Date(checkInTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        {hasAttendance && (
          <button
            onClick={(e) => handleDeleteClick(student, e)}
            className="tw-p-2 tw-rounded-full tw-transition-all hover:tw-text-red-500 hover:tw-shadow-md tw-border-none tw-border-gray-300 hover:tw-border-red-500 tw-bg-white"
            title="Delete attendance record"
          >
            <FaTrashAlt className="tw-w-5 tw-h-5 tw-text-red-400 hover:tw-text-red-600" />
          </button>
        )}
      </div>
    );
  }, [handleStatusClick]);

  const StatusFilterButton = ({ status, count }) => {
    const statusConfig = STATUS_STYLES[status];
    const isSelected = selectedFilter === status;

    return (
      <button
        onClick={() => setSelectedFilter(isSelected ? null : status)}
        className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-border-none hover:tw-shadow-md
        ${isSelected ? 'tw-ring-2 tw-ring-gray-400' : ''} 
        ${statusConfig.className}`}
      >
        {statusConfig.icon({})}
        <span>{statusConfig.text}</span>
        <span className={`tw-text-sm tw-px-2 tw-py-1`}>
          {count}
        </span>
      </button>
    );
  };

  const renderConfirmationModal = () => (
    <Modal
      show={dialogOpen}
      onHide={handleClose}
      aria-labelledby="modal-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">
          {dialogType === DIALOG_TYPES.MARK ? 'Mark Attendance' : 'Delete Attendance'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {dialogType === DIALOG_TYPES.MARK
            ? `Are you sure you want to mark attendance for ${selectedStudent?.name}? This will be marked based on current time.`
            : `Are you sure you want to delete the attendance record for ${selectedStudent?.name}?`
          }
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant={dialogType === DIALOG_TYPES.MARK ? 'primary' : 'danger'}
          onClick={
            dialogType === DIALOG_TYPES.MARK ? handleManualAttendance : handleDeleteAttendance
          }
          className={
            dialogType === DIALOG_TYPES.MARK
              ? "tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-700 tw-text-white tw-rounded hover:tw-opacity-80"
              : "tw-bg-red-600 tw-text-white tw-rounded hover:tw-bg-red-700"
          }
        >
          {dialogType === DIALOG_TYPES.MARK ? 'Mark Attendance' : 'Delete Attendance'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const debouncedSearch = useMemo(() =>
    debounce((term) => {
      const filtered = filterStudents(term);
      setFilteredStudents(filtered);
    }, 300),
    [filterStudents]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    const filtered = filterStudents(searchTerm, selectedFilter);
    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedFilter, filterStudents]);

  useEffect(() => {
    if (courseId) {
      loadStoredAttendance();
      fetchAttendanceStatus();

      const interval = setInterval(fetchAttendanceStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [courseId, loadStoredAttendance, fetchAttendanceStatus]);

  useEffect(() => {
    const handleStorageUpdate = (event) => {
      if (event.key === 'attendanceUpdate') {
        const update = JSON.parse(event.newValue);
        if (update.type === 'delete') {
          localStorage.removeItem(storageKey);
          fetchAttendanceStatus();
        }
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [fetchAttendanceStatus, storageKey]);

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

        {/* Status Filters */}
        <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 tw-gap-2 tw-mb-6 tw-max-w-md">
          <StatusFilterButton
            status={ATTENDANCE_STATUS.PRESENT}
            count={getStatusCounts[ATTENDANCE_STATUS.PRESENT]}
          />
          <StatusFilterButton
            status={ATTENDANCE_STATUS.LATE}
            count={getStatusCounts[ATTENDANCE_STATUS.LATE]}
          />
          <StatusFilterButton
            status={ATTENDANCE_STATUS.ABSENT}
            count={getStatusCounts[ATTENDANCE_STATUS.ABSENT]}
          />
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
                key={`${student.id}-${lastUpdate}`}
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
                {renderStatusInfo({
                  ...getAttendanceInfo(student.id),
                  student
                })}
              </div>
            ))
          ) : (
            <div className="tw-text-center tw-py-8">
              <UserGroupIcon className="tw-w-12 tw-h-12 tw-text-gray-400 tw-mx-auto tw-mb-3" />
              <p className="tw-text-gray-500 tw-text-lg">
                {searchTerm || selectedFilter ? 'No students found.' : 'No students enrolled in this course.'}
              </p>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {renderConfirmationModal()}
      </Card.Body>
    </Card>
  );
};

export default StudentList;