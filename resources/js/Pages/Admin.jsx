import React from 'react';
import CustomNavbar  from '../components/CustomNavbar';
import { Inertia } from '@inertiajs/inertia';
const Student = ({auth}) => {
    const userRole = 'admin'
    return(
        <div>
            <CustomNavbar userRole={userRole} user={auth.user}/>
            <h1>hello Admin</h1>
        </div>
    )
    
};

export default Student;