import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Table, Alert, Spinner, Button } from 'react-bootstrap';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Calendar, Search, UserCheck, UserX, Clock, Users, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { FaArrowLeft } from 'react-icons/fa';
import CustomNavbar from '../../components/CustomNavbar';
import { Inertia } from '@inertiajs/inertia';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import StudentAttendanceStats from './StudentAttendanceStats';

const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className="tw-bg-white tw-shadow-sm">
        <Card.Body className="tw-flex tw-items-center tw-space-x-3">
            <div className={`tw-p-3 tw-rounded-full ${color}`}>
                <Icon className="tw-w-6 tw-h-6 tw-text-white" />
            </div>
            <div>
                <p className="tw-text-sm tw-text-gray-500">{title}</p>
                <p className="tw-text-xl tw-font-bold">{value}</p>
            </div>
        </Card.Body>
    </Card>
);

const StudentAttendanceRecord = ({ auth }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState(() => {
        const malaysiaTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kuala_Lumpur",
        });
        const malaysiaDate = new Date(malaysiaTime);
        const year = malaysiaDate.getFullYear();
        const month = String(malaysiaDate.getMonth() + 1).padStart(2, "0");
        const day = String(malaysiaDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const userRole = 'lecture';
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`/courses/lecturer/${auth.user.id}`);
                if (response.data) {
                    setCourses(response.data);
                } else {
                    setError('No courses found');
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError(err.response?.data?.message || 'Failed to load courses');
            }
        };

        if (auth.user?.id) {
            fetchCourses();
        }
    }, [auth.user?.id]);

    useEffect(() => {
        const fetchStudentsAndAttendance = async () => {
            if (!selectedCourse) return;

            setLoading(true);
            try {
                const studentsResponse = await axios.get(`/api/courses/${selectedCourse}/students`);
                console.log('Students Response:', studentsResponse.data);

                const attendanceResponse = await axios.get(`/api/attendance-status/course/${selectedCourse}`, {
                    params: { date: selectedDate }
                });
                console.log('Attendance Response:', attendanceResponse.data);

                setStudents(studentsResponse.data);
                setAttendanceData(attendanceResponse.data);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsAndAttendance();
    }, [selectedCourse, selectedDate]);


    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'present':
                return 'tw-bg-green-100 tw-text-green-800';
            case 'late':
                return 'tw-bg-yellow-100 tw-text-yellow-800';
            case 'absent':
                return 'tw-bg-gray-100 tw-text-gray-800';
            default:
                return 'tw-bg-gray-100 tw-text-gray-800';
        }
    };

    const handleBack = () => {
        Inertia.visit('/lecture');
    };

    const filteredStudents = students.filter(student => {
        const searchTerm = searchQuery.toLowerCase();
        return (
            student.student_id.toString().toLowerCase().includes(searchTerm) ||
            student.name.toLowerCase().includes(searchTerm)
        );
    });

    const clearSearch = () => {
        setSearchQuery('');
    };


    const defaultChartData = [
        { name: 'Present', value: 0, color: '#10B981' },
        { name: 'Late', value: 0, color: '#F59E0B' },
        { name: 'Absent', value: 0, color: '#6B7280' }
    ];

    const getAttendanceStats = () => {
        if (!selectedCourse || students.length === 0) {
            return { total: 0, present: 0, late: 0, absent: 0 };
        }

        const total = students.length;
        const present = filteredStudents.filter(s =>
            attendanceData[s.pivot.student_id]?.status === 'present').length;
        const late = filteredStudents.filter(s =>
            attendanceData[s.pivot.student_id]?.status === 'late').length;
        const absent = total - present - late;

        return { total, present, late, absent };
    };

    const stats = getAttendanceStats();
    const chartData = selectedCourse ? [
        { name: 'Present', value: stats.present, color: '#10B981', percentage: ((stats.present / stats.total) * 100).toFixed(1) + '%' },
        { name: 'Late', value: stats.late, color: '#F59E0B', percentage: ((stats.late / stats.total) * 100).toFixed(1) + '%' },
        { name: 'Absent', value: stats.absent, color: '#6B7280', percentage: ((stats.absent / stats.total) * 100).toFixed(1) + '%' }
    ] : defaultChartData;

    const sortData = (key) => {
        setSortConfig((prevConfig) => {

            if (prevConfig.key === key) {
                if (prevConfig.direction === 'descending') {
                    return { key: null, direction: null };
                }
                return { key, direction: 'descending' };
            }
            return { key, direction: 'ascending' };
        });
    };

    // getSortIcon function
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <ArrowUp className="tw-w-4 tw-h-4 tw-text-gray-400" />;
        }
        return sortConfig.direction === 'ascending' ?
            <ArrowUp className="tw-w-4 tw-h-4 tw-text-blue-600" /> :
            <ArrowDown className="tw-w-4 tw-h-4 tw-text-blue-600" />;
    };

    // filteredStudents
    const sortedStudents = React.useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) {
            return [...filteredStudents];
        }

        return [...filteredStudents].sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'status') {
                const statusOrder = { present: 1, late: 2, absent: 3 };
                aValue = statusOrder[attendanceData[a.pivot.student_id]?.status || 'absent'];
                bValue = statusOrder[attendanceData[b.pivot.student_id]?.status || 'absent'];
            } else if (sortConfig.key === 'check_in_time') {
                aValue = attendanceData[a.pivot.student_id]?.check_in_time || '';
                bValue = attendanceData[b.pivot.student_id]?.check_in_time || '';
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [filteredStudents, sortConfig, attendanceData]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="tw-bg-white tw-p-2 tw-shadow-lg tw-rounded-lg tw-border">
                    <p className="tw-font-semibold">{data.name}</p>
                    <p>Count: {data.value}</p>
                    <p>Percentage: {data.percentage}</p>
                </div>
            );
        }
        return null;
    };

    // Add new export functions
    const exportToExcel = () => {
        if (!selectedCourse || sortedStudents.length === 0) {
            alert('Please select a course and ensure there is data to export');
            return;
        }

        // Prepare the data for export
        const exportData = sortedStudents.map((student, index) => {
            const attendance = attendanceData[student.pivot.student_id] || {};
            return {
                'No.': index + 1,
                'Student ID': student.student_id,
                'Student Name': student.name,
                'Status': attendance.status || 'absent',
                'Check-in Time': attendance.check_in_time ?
                    new Date(attendance.check_in_time).toLocaleString('en-US', {
                        timeZone: 'Asia/Kuala_Lumpur'
                    }) : 'N/A'
            };
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

        // Generate filename with course and date
        const selectedCourseInfo = courses.find(course => course.id.toString() === selectedCourse.toString());
        const courseId = selectedCourseInfo?.course_id || 'unknown';
        const courseName = selectedCourseInfo?.course_name || 'unknown';
        const filename = `attendance_${courseId}_${courseName}_${selectedDate}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
    };

    const exportToPDF = () => {
        if (!selectedCourse || sortedStudents.length === 0) {
            alert('Please select a course and ensure there is data to export');
            return;
        }

        const doc = new jsPDF();
        const selectedCourseInfo = courses.find(course => course.id.toString() === selectedCourse.toString());
        const courseId = selectedCourseInfo?.course_id || 'unknown';
        const courseName = selectedCourseInfo?.course_name || 'unknown';
        const courseStartTime = selectedCourseInfo?.course_start_time || 'unknown';
        const courseEndTime = selectedCourseInfo?.course_end_time || 'unknown';

        // Add title centered at the top
        doc.setFontSize(16);
        const title = 'Student Attendance Record';
        const titleWidth = doc.getStringUnitWidth(title) * 16 / doc.internal.scaleFactor;
        const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
        doc.text(title, titleX, 20);

        // Course information - Two columns layout
        doc.setFontSize(12);
        // Left column
        doc.text(`Course ID: ${courseId}`, 14, 35);
        doc.text(`Course Start Time: ${courseStartTime}`, 14, 45);
        doc.text(`Date: ${selectedDate}`, 14, 55);

        // Right column
        doc.text(`Course Name: ${courseName}`, 110, 35);
        doc.text(`Course End Time: ${courseEndTime}`, 110, 45);

        // Attendance Summary - Two columns layout
        doc.setFont(undefined, 'bold');
        doc.text('Attendance Summary:', 14, 70);
        doc.setFont(undefined, 'normal');


        doc.text(`Total Students: ${stats.total}`, 14, 80);
        doc.text(`Present: ${stats.present}`, 14, 90);
        doc.text(`Late: ${stats.late}`, 58, 90);
        doc.text(`Absent: ${stats.absent}`, 94, 90);

        // Prepare table data
        const tableData = sortedStudents.map((student, index) => {
            const attendance = attendanceData[student.pivot.student_id] || {};
            return [
                index + 1,
                student.student_id,
                student.name,
                attendance.status || 'absent',
                attendance.check_in_time ?
                    new Date(attendance.check_in_time).toLocaleString('en-US', {
                        timeZone: 'Asia/Kuala_Lumpur'
                    }) : 'N/A'
            ];
        });

        // Add table
        doc.autoTable({
            startY: 100,
            head: [['No.', 'Student ID', 'Name', 'Status', 'Check-in Time']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 139, 202] }
        });

        // Save PDF
        const filename = `attendance_${selectedCourseInfo?.course_id || 'course'}_${selectedDate}.pdf`;
        doc.save(filename);
    };

    return (
        <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
            <CustomNavbar userRole={userRole} user={auth.user} />

            <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-mt-2">
                <h1 className="tw-text-2xl sm:tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent tw-mt-4">
                    Student Attendance Record
                </h1>
            </div>
            <Container className="p-2">
                <Button
                    onClick={handleBack}
                    className="tw-mb-4 tw-flex tw-items-center tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white hover:tw-opacity-80"
                >
                    <FaArrowLeft className="tw-mr-2" />
                    Back
                </Button>
                <div className="tw-mb-8">
                    <Card className="tw-shadow-xl tw-rounded-xl tw-overflow-hidden">
                        <Card.Body className="tw-p-6">
                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                                <Form.Group>
                                    <Form.Label className="tw-font-semibold tw-text-gray-700">Select Course</Form.Label>
                                    <Form.Select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="tw-w-full tw-p-2 tw-border tw-rounded-lg"
                                    >
                                        <option value="" disabled hidden>Choose a course...</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_id} - {course.course_name} - {course.course_start_time} - {course.course_end_time}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className="tw-font-semibold tw-text-gray-700">Select Date</Form.Label>
                                    <div className="tw-relative">
                                        <Calendar className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-h-5 tw-w-5 tw-text-gray-400" />
                                        <Form.Control
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2"
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className="tw-font-semibold tw-text-gray-700">Search Students</Form.Label>
                                    <div className="tw-relative">
                                        <Search className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-h-5 tw-w-5 tw-text-gray-400" />
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by ID or name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2"
                                        />
                                        {searchQuery && (
                                            <XCircleIcon
                                                className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-w-5 tw-h-5 tw-text-gray-400 tw-cursor-pointer hover:tw-text-gray-600"
                                                onClick={clearSearch}
                                            />
                                        )}
                                    </div>
                                </Form.Group>
                            </div>

                            <div className="tw-flex tw-justify-end tw-mb-4 tw-space-x-2">
                                <Button
                                    className="tw-flex tw-items-center tw-bg-green-600"
                                    onClick={exportToExcel}
                                >
                                    <Download className="tw-w-4 tw-h-4 tw-mr-2" />
                                    Export Excel
                                </Button>
                                <Button
                                    className="tw-flex tw-items-center tw-bg-red-600"
                                    onClick={exportToPDF}
                                >
                                    <Download className="tw-w-4 tw-h-4 tw-mr-2" />
                                    Export PDF
                                </Button>
                            </div>

                            {error && (
                                <Alert variant="danger" className="tw-mb-4">
                                    {error}
                                </Alert>
                            )}

                            <div className="tw-overflow-x-auto">
                                <Table responsive hover className="tw-mb-0">
                                    <thead className="tw-bg-gray-50">
                                        <tr>
                                            <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">
                                                No.
                                            </th>
                                            <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">
                                                Student ID
                                            </th>
                                            <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">
                                                Student Name
                                            </th>
                                            <th
                                                className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-cursor-pointer hover:tw-bg-gray-100 group"
                                                onClick={() => sortData('status')}
                                            >
                                                <div className="tw-flex tw-items-center tw-space-x-1">
                                                    <span>Status</span>
                                                    <div className="tw-relative">
                                                        {getSortIcon('status')}
                                                        {sortConfig.key === 'status' && sortConfig.direction === 'descending' && (
                                                            <span className="tw-absolute tw-hidden group-hover:tw-block tw-bg-gray-800 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs -tw-top-8 tw-left-1/2 -tw-translate-x-1/2">
                                                                Click to reset
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                            <th
                                                className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-cursor-pointer hover:tw-bg-gray-100 group"
                                                onClick={() => sortData('check_in_time')}
                                            >
                                                <div className="tw-flex tw-items-center tw-space-x-1">
                                                    <span>Check-in Time</span>
                                                    <div className="tw-relative">
                                                        {getSortIcon('check_in_time')}
                                                        {sortConfig.key === 'check_in_time' && sortConfig.direction === 'descending' && (
                                                            <span className="tw-absolute tw-hidden group-hover:tw-block tw-bg-gray-800 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs -tw-top-8 tw-left-1/2 -tw-translate-x-1/2">
                                                                Click to reset
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="tw-text-center tw-py-4">
                                                    <Spinner animation="border" role="status" className="tw-mr-2" />
                                                    <span>Loading...</span>
                                                </td>
                                            </tr>
                                        ) : sortedStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="tw-text-center tw-py-4 tw-text-gray-500">
                                                    No students found
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedStudents.map((student, index) => {
                                                const attendance = attendanceData[student.pivot.student_id] || {};
                                                const status = attendance.status || 'absent';
                                                const StatusIcon = status === 'present' ? UserCheck :
                                                    status === 'late' ? Clock : UserX;

                                                return (
                                                    <tr key={student.student_id}>
                                                        <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                            {index + 1}.
                                                        </td>
                                                        <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                            {student.student_id}
                                                        </td>
                                                        <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                            {student.name}
                                                        </td>
                                                        <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                            <span className={`tw-items-center tw-px-6 tw-py-1 tw-rounded-full tw-space-x-2 tw-text-sm tw-font-semibold ${getStatusBadgeClass(status)}`}>
                                                                <StatusIcon className="tw-w-4 tw-h-4 tw-mb-1" />
                                                                <span>{status}</span>
                                                            </span>
                                                        </td>
                                                        <td className="tw-px-6 tw-py-4">
                                                            {attendance.check_in_time ?
                                                                new Date(attendance.check_in_time).toLocaleString('en-US', {
                                                                    timeZone: 'Asia/Kuala_Lumpur'
                                                                }) : 'N/A'
                                                            }
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4 tw-mb-6">
                    <StatCard icon={Users} title="Total Students" value={stats.total} color="tw-bg-blue-500" />
                    <StatCard icon={UserCheck} title="Present" value={stats.present} color="tw-bg-green-500" />
                    <StatCard icon={Clock} title="Late" value={stats.late} color="tw-bg-yellow-500" />
                    <StatCard icon={UserX} title="Absent" value={stats.absent} color="tw-bg-gray-500" />
                </div>

                {/* Attendance Chart */}
                <Card className="tw-mb-6">
                    <Card.Body>
                        <h3 className="tw-text-lg tw-font-semibold tw-mb-4">Attendance Distribution</h3>
                        <div className="tw-h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ value, percentage }) => `${value} (${percentage})`}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card.Body>
                </Card>

                {selectedCourse && (
                    <StudentAttendanceStats
                        selectedCourse={selectedCourse}
                        selectedDate={selectedDate}
                    />
                )}
            </Container>
        </div>
    );
};

export default StudentAttendanceRecord;