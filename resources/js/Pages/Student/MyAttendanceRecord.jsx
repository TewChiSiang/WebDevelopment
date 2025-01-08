import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Table, Alert, Spinner, Button } from 'react-bootstrap';
import { Calendar, UserCheck, UserX, Clock, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { FaArrowLeft } from 'react-icons/fa';
import CustomNavbar from '../../components/CustomNavbar';
import { Inertia } from '@inertiajs/inertia';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import AttendanceStats from './AttendanceStats';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

const MyAttendanceRecord = ({ auth }) => {
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
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const userRole = 'student';

    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            if (!selectedDate || !auth.user?.id) {
                console.log('Missing required data:', {
                    selectedDate,
                    userId: auth.user?.id
                });
                return;
            }

            setLoading(true);
            try {
                console.log('Fetching attendance with:', {
                    userId: auth.user.id,
                    date: selectedDate
                });

                const response = await axios.get(`/students/${auth.user.id}/daily-attendance`, {
                    params: {
                        date: selectedDate
                    }
                });

                console.log('API Response:', response.data);
                setAttendanceRecords(response.data);
            } catch (err) {
                console.error('Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError('Failed to load attendance records');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceRecords();
    }, [selectedDate, auth.user?.id]);

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
        Inertia.visit('/student');
    };

    // Calculate attendance statistics
    const getAttendanceStats = () => {
        if (!attendanceRecords.length) {
            return { total: 0, present: 0, late: 0, absent: 0 };
        }

        return attendanceRecords.reduce((acc, record) => {
            acc.total++;
            if (record.status === 'present') acc.present++;
            else if (record.status === 'late') acc.late++;
            else acc.absent++;
            return acc;
        }, { total: 0, present: 0, late: 0, absent: 0 });
    };

    const stats = getAttendanceStats();
    const chartData = [
        { name: 'Present', value: stats.present, color: '#10B981', percentage: ((stats.present / stats.total) * 100).toFixed(1) + '%' },
        { name: 'Late', value: stats.late, color: '#F59E0B', percentage: ((stats.late / stats.total) * 100).toFixed(1) + '%' },
        { name: 'Absent', value: stats.absent, color: '#6B7280', percentage: ((stats.absent / stats.total) * 100).toFixed(1) + '%' }
    ];

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

    // Get sort icon
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <ArrowUp className="tw-w-4 tw-h-4 tw-text-gray-400" />;
        }
        return sortConfig.direction === 'ascending' ?
            <ArrowUp className="tw-w-4 tw-h-4 tw-text-blue-600" /> :
            <ArrowDown className="tw-w-4 tw-h-4 tw-text-blue-600" />;
    };

    // Sort the attendance records
    const sortedRecords = React.useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction || !attendanceRecords) {
            return attendanceRecords;
        }

        return [...attendanceRecords].sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'status') {
                const statusOrder = { present: 1, late: 2, absent: 3 };
                aValue = statusOrder[a.status];
                bValue = statusOrder[b.status];
            } else if (sortConfig.key === 'check_in_time') {
                aValue = a.check_in_time || '';
                bValue = b.check_in_time || '';
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [attendanceRecords, sortConfig]);

    // Export to Excel function
    const exportToExcel = () => {
        if (!attendanceRecords.length) {
            alert('No attendance records to export');
            return;
        }

        const exportData = attendanceRecords.map((record, index) => ({
            'No.': index + 1,
            'Course ID': record.course_code,
            'Course Name': record.course_name,
            'Status': record.status,
            'Check-in Time': record.check_in_time ?
                new Date(record.check_in_time).toLocaleString('en-US', {
                    timeZone: 'Asia/Kuala_Lumpur'
                }) : 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

        const filename = `my_attendance_${selectedDate}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    // Export to PDF function
    const exportToPDF = () => {
        if (!attendanceRecords.length) {
            alert('No attendance records to export');
            return;
        }

        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        const title = 'My Attendance Record';
        const titleWidth = doc.getStringUnitWidth(title) * 16 / doc.internal.scaleFactor;
        const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
        doc.text(title, titleX, 20);

        // Add date
        doc.setFontSize(12);
        doc.text(`Date: ${selectedDate}`, 14, 30);

        // Add attendance summary
        doc.setFont(undefined, 'bold');
        doc.text('Attendance Summary:', 14, 45);
        doc.setFont(undefined, 'normal');

        const stats = getAttendanceStats();
        doc.text(`Present: ${stats.present}`, 14, 55);
        doc.text(`Late: ${stats.late}`, 58, 55);
        doc.text(`Absent: ${stats.absent}`, 94, 55);

        // Prepare table data
        const tableData = sortedRecords.map((record, index) => [
            index + 1,
            record.course_code,
            record.course_name,
            record.status,
            record.check_in_time ?
                new Date(record.check_in_time).toLocaleString('en-US', {
                    timeZone: 'Asia/Kuala_Lumpur'
                }) : 'N/A'
        ]);

        // Add table
        doc.autoTable({
            startY: 65,
            head: [['No.', 'Course ID', 'Course Name', 'Status', 'Check-in Time']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 139, 202] }
        });

        const filename = `my_attendance_${selectedDate}.pdf`;
        doc.save(filename);
    };

    return (
        <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
            <CustomNavbar userRole={userRole} user={auth.user} />

            <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-mt-2">
                <h1 className="tw-text-2xl sm:tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent tw-mt-4">
                    My Attendance Record
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


                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                    <StatCard icon={UserCheck} title="Present" value={stats.present} color="tw-bg-green-500" />
                    <StatCard icon={Clock} title="Late" value={stats.late} color="tw-bg-yellow-500" />
                    <StatCard icon={UserX} title="Absent" value={stats.absent} color="tw-bg-gray-500" />
                </div>

                {/* Attendance Chart */}
                <Card className="tw-mb-6">
                    <Card.Body>
                        <h3 className="tw-text-lg tw-font-semibold tw-mb-4">Daily Attendance Overview</h3>
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



                <Card className="tw-shadow-xl tw-rounded-xl tw-overflow-hidden tw-mb-8">
                    <Card.Body className="tw-p-6">
                        <Form.Group className="tw-mb-6">
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
                                            Course Id
                                        </th>
                                        <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">
                                            Course Name
                                        </th>
                                        <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase">
                                            Weekday
                                        </th>
                                        <th
                                            className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-cursor-pointer hover:tw-bg-gray-100 group"
                                            onClick={() => sortData('status')}
                                        >
                                            <div className="tw-flex tw-items-center tw-space-x-1">
                                                <span>Status</span>
                                                <div className="tw-relative">
                                                    {getSortIcon('status')}
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
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="tw-text-center tw-py-4">
                                                <Spinner animation="border" role="status" className="tw-mr-2" />
                                                <span>Loading...</span>
                                            </td>
                                        </tr>
                                    ) : sortedRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="tw-text-center tw-py-4 tw-text-gray-500">
                                                No attendance records found for this date
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedRecords.map((record, index) => {
                                            const StatusIcon = record.status === 'present' ? UserCheck :
                                                record.status === 'late' ? Clock : UserX;

                                            return (
                                                <tr key={record.course_id}>
                                                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                        {index + 1}.
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                        {record.course_code}
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                        {record.course_name}
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                        {record.weekday}
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                        <span className={`tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-semibold ${getStatusBadgeClass(record.status)}`}>
                                                            <StatusIcon className="tw-w-4 tw-h-4 tw-mr-2" />
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                                        {record.check_in_time ?
                                                            new Date(record.check_in_time).toLocaleString('en-US', {
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
                <AttendanceStats auth={auth} />
            </Container>
        </div>
    );
};

export default MyAttendanceRecord;