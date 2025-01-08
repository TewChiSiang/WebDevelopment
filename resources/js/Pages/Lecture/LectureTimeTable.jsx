import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Calendar, Clock, BookOpen, Download, RefreshCw, Eye, EyeOff } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button, Card, Alert, Container, Table, Spinner } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import CustomNavbar from '../../components/CustomNavbar';
import { Inertia } from '@inertiajs/inertia';

const LectureTimeTable = ({ auth }) => {
  const userRole = 'lecture';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmptySlots, setShowEmptySlots] = useState(true);
  const tableRef = useRef(null);
  const containerRef = useRef(null);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = Array.from({ length: 16 }, (_, i) => i + 8);

  const fetchTimeTable = async () => {
    try {
      const response = await fetch('/get-timetable');
      if (!response.ok) throw new Error('Network response was not ok');
      const courseData = await response.json();

      if (!Array.isArray(courseData)) {
        throw new Error('Invalid data format received from server');
      }

      const validCourses = courseData.filter(course =>
        course &&
        typeof course.weekday === 'string' &&
        typeof course.course_start_time === 'string' &&
        typeof course.course_end_time === 'string' &&
        typeof course.course_name === 'string' &&
        typeof course.course_id === 'string'
      );

      setCourses(validCourses);
      setLoading(false);
    } catch (error) {
      setError('Failed to load timetable data: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeTable();
  }, []);

  const getCourseForSlot = (day, time) => {
    try {
      return courses.find(course => {
        // 确保时间格式正确
        if (!course.course_start_time?.includes(':') || !course.course_end_time?.includes(':')) {
          console.warn('Invalid time format for course:', course);
          return false;
        }

        // 解析时间
        const [startHour, startMinute] = course.course_start_time.split(':').map(Number);
        const [endHour, endMinute] = course.course_end_time.split(':').map(Number);

        // 验证时间值是否有效
        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
          console.warn('Invalid time values for course:', course);
          return false;
        }

        const slotStartMinutes = time * 60;
        const slotEndMinutes = (time + 1) * 60;
        const courseStartMinutes = startHour * 60 + startMinute;
        const courseEndMinutes = endHour * 60 + endMinute;


        const isOvernight = courseEndMinutes < courseStartMinutes;
        if (isOvernight) {
          return (
            course.weekday.toLowerCase() === day.toLowerCase() &&
            ((courseStartMinutes < slotEndMinutes) ||
              (courseEndMinutes > slotStartMinutes))
          );
        }

        return (
          course.weekday.toLowerCase() === day.toLowerCase() &&
          courseStartMinutes < slotEndMinutes &&
          courseEndMinutes > slotStartMinutes
        );
      });
    } catch (error) {
      console.error('Error in getCourseForSlot:', error);
      return null;
    }
  };

  const handleDownloadPNG = async () => {
    try {

      if (containerRef.current) {
        const originalStyle = containerRef.current.style.cssText;
        containerRef.current.style.width = 'max-content';
        containerRef.current.style.overflow = 'visible';


        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(tableRef.current, {
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });


        containerRef.current.style.cssText = originalStyle;

        const link = document.createElement('a');
        const username = auth.user?.name || 'user';
        const date = new Date().toISOString().split('T')[0];
        link.download = `lecture_timetable_${username}_${date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Failed to generate PNG. Please try again.');
    }
  };

  const filteredTimeSlots = showEmptySlots
    ? timeSlots
    : timeSlots.filter(time =>
      weekDays.some(day => getCourseForSlot(day, time))
    );

  if (loading) {
    return (
      <div className="tw-min-h-screen tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100">
        <CustomNavbar userRole={userRole} user={auth.user} />
        <div className="tw-flex tw-justify-center tw-items-center tw-h-[300px]">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-min-h-screen tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100">
        <CustomNavbar userRole={userRole} user={auth.user} />
        <Container className="tw-py-4">
          <Alert variant="danger" className="tw-shadow-lg">
            <Alert.Heading className="tw-flex tw-items-center">
              <AlertCircle className="tw-w-5 tw-h-5 tw-mr-2" />
              Error
            </Alert.Heading>
            <p>{error}</p>
            <div className="tw-mt-3">
              <Button
                variant="outline-danger"
                onClick={fetchTimeTable}
                className="tw-flex tw-items-center"
              >
                <RefreshCw className="tw-w-4 tw-h-4 tw-mr-2" />
                Retry Loading
              </Button>
            </div>
          </Alert>
        </Container>
      </div>
    );
  }

  const handleBack = () => {
    Inertia.visit('/lecture');
  };

  return (
    <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
      <CustomNavbar userRole={userRole} user={auth.user} />
      <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-mt-2">
        <h1 className="tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent tw-mt-4">
          Lecture Timetable
        </h1>
      </div>

      <Container className="p-2">
        <div className="tw-flex tw-flex-wrap tw-justify-between tw-gap-2 tw-mb-4 lg:tw-flex-nowrap">
          <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
            <Button
              onClick={handleBack}
              className="tw-flex tw-items-center tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white hover:tw-opacity-80"
            >
              <FaArrowLeft className="tw-mr-2" />
              Back
            </Button>

            <Button
              onClick={() => setShowEmptySlots(!showEmptySlots)}
              variant="outline-primary"
              className="tw-flex tw-items-center tw-gap-2"
            >
              {showEmptySlots ? <EyeOff className="tw-w-4 tw-h-4" /> : <Eye className="tw-w-4 tw-h-4" />}
              {showEmptySlots ? 'Hide Empty Slots' : 'Show Empty Slots'}
            </Button>
          </div>

          <Button
            className="tw-flex tw-items-center tw-bg-red-600 hover:tw-opacity-80"
            onClick={handleDownloadPNG}
          >
            <Download className="tw-w-4 tw-h-4 tw-mr-2" />
            Export PNG
          </Button>
        </div>


        <Card className="tw-shadow-lg">
          <Card.Header className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-text-white">
            <div className="tw-flex tw-items-center">
              <Calendar className="tw-w-6 tw-h-6 tw-mr-2" />
              <h2 className="tw-text-xl tw-font-semibold tw-mb-0">Class Schedule</h2>
              <div className="tw-ml-auto tw-flex tw-items-center tw-gap-2">
                <Clock className="tw-w-4 tw-h-4" />
                <span className="tw-text-sm">
                  Current Time: {new Date().toLocaleTimeString('en-US', {
                    timeZone: 'Asia/Kuala_Lumpur',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </Card.Header>

          <Card.Body className="tw-p-0">
            <div
              ref={containerRef}
              className="tw-overflow-x-auto tw-max-w-full"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#4B5563 #E5E7EB',
              }}
            >
              <div
                ref={tableRef}
                className="tw-min-w-max"
              >
                <Table bordered responsive className="tw-mb-0">
                  <thead className="tw-bg-gray-50">
                    <tr>
                      <th className="tw-p-4 tw-text-center tw-w-24">
                        <div className="tw-flex tw-items-center tw-justify-center">
                          <Clock className="tw-w-4 tw-h-4 tw-mr-2" />
                          Time
                        </div>
                      </th>
                      {weekDays.map(day => (
                        <th key={day} className="tw-p-4 tw-text-center">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTimeSlots.map(time => (
                      <tr key={time}>
                        <td className="tw-p-4 tw-text-center tw-font-medium">
                          {`${time}:00- ${time + 1}:00`}
                        </td>
                        {weekDays.map(day => {
                          const course = getCourseForSlot(day, time);

                          return (
                            <td
                              key={`${day}-${time}`}
                              className={`tw-p-4 ${course ? 'tw-bg-blue-50' : ''}`}>
                              {course && (
                                <div className="tw-rounded tw-p-2">
                                  <div className="tw-flex tw-items-center tw-mb-2">
                                    <BookOpen className="tw-w-4 tw-h-4 tw-text-blue-600 tw-mr-2" />
                                    <span className="tw-font-semibold tw-text-blue-600">
                                      {course.course_name}
                                    </span>
                                  </div>
                                  <div className="tw-flex tw-items-center tw-mb-2">
                                    <span className="tw-bg-blue-500 tw-text-white tw-px-2 tw-py-1 tw-rounded-md tw-text-sm">
                                      {course.course_id}
                                    </span>
                                  </div>
                                  <div className="tw-flex tw-items-center tw-text-sm tw-text-gray-600">
                                    <Clock className="tw-w-3 tw-h-3 tw-mr-1" />
                                    <span>{`${course.course_start_time} - ${course.course_end_time}`}</span>
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LectureTimeTable;