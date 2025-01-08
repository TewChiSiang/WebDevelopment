import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendanceStats = ({ auth }) => {
    const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
    const [endMonth, setEndMonth] = useState(startMonth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(0, i).toLocaleString('default', { month: 'long' })
    }));

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/students/${auth.user.id}/attendance-stats?startMonth=${startMonth}&endMonth=${endMonth}`);
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [startMonth, endMonth, auth.user.id]);

    if (!stats) return null;

    const courseData = stats.courseStats?.map(course => ({
        name: course.course_code,
        "Attendance Rate": course.attendance_rate
    }));

    const handleStartMonthChange = (e) => {
        const month = parseInt(e.target.value);
        setStartMonth(month);
        if (month > endMonth) setEndMonth(month);
    };

    const handleEndMonthChange = (e) => {
        const month = parseInt(e.target.value);
        setEndMonth(month);
        if (month < startMonth) setStartMonth(month);
    };

    return (
        <Card className="tw-mb-6">
            <Card.Body>
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h3 className="tw-text-lg tw-font-semibold tw-m-0">Monthly Attendance Overview</h3>
                    <div className="tw-flex tw-gap-3">
                        <Form.Group>
                            <Form.Select 
                                value={startMonth} 
                                onChange={handleStartMonthChange}
                                className="tw-w-36"
                            >
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Select
                                value={endMonth}
                                onChange={handleEndMonthChange}
                                className="tw-w-36"
                            >
                                {months.map(month => (
                                    <option 
                                        key={month.value} 
                                        value={month.value}
                                        disabled={month.value < startMonth}
                                    >
                                        {month.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>
                </div>

                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                    <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg">
                        <p className="tw-text-sm tw-text-gray-600">Overall Attendance Rate</p>
                        <p className="tw-text-2xl tw-font-bold tw-text-blue-600">
                                {stats.overall_attendance_rate}%
                            </p>
                        </div>
                    
                    <div className="tw-bg-green-50 tw-p-4 tw-rounded-lg">
                        <p className="tw-text-sm tw-text-gray-600">Total Classes</p>
                        <p className="tw-text-2xl tw-font-bold tw-text-green-600">
                                {stats.total_classes}
                            </p>
                        </div>
                 
                  
                        <div className="tw-bg-purple-50 tw-p-4 tw-rounded-lg">
                        <p className="tw-text-sm tw-text-gray-600">Period</p>
                        <p className="tw-text-sm tw-font-medium tw-text-purple-600">
                                {stats.period.start} to {stats.period.end}
                            </p>
                        </div>
                 </div>
              

                <div className="tw-h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Attendance Rate" fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="tw-mt-4">
                    <h4 className="tw-text-lg tw-font-semibold tw-mb-3">Course-wise Breakdown</h4>
                    <div className="tw-flex tw-flex-col tw-gap-3">
                        {stats.courseStats?.map((course, index) => (
                            <Card key={course.course_code} className="tw-border">
                                <Card.Body className="tw-flex tw-justify-between tw-items-center tw-p-3">
                                    <div>
                                        <p className="tw-font-medium tw-mb-1">
                                            {index + 1}. {course.course_code}
                                        </p>
                                        <p className="tw-text-gray-600 tw-text-sm tw-mb-0">{course.course_name}</p>
                                    </div>
                                    <div className="tw-text-right">
                                        <p className="tw-text-xl tw-font-bold tw-text-blue-600 tw-mb-1">
                                            {course.attendance_rate}%
                                        </p>
                                        <p className="tw-text-gray-600 tw-text-sm tw-mb-0">
                                            {course.present + course.late}/{course.total_classes} classes
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default AttendanceStats;