import React from 'react';
import CustomNavbar  from '../components/CustomNavbar';
import { Inertia } from '@inertiajs/inertia';
const Student = ({auth}) => {
    const userRole='student';
    return(
        <div>
            <CustomNavbar userRole={userRole} user={auth.user}/>
            <h1>hello student</h1>
            <h2></h2>
        </div>
    )
    
};

export default Student;