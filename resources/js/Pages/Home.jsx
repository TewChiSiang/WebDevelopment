import React from 'react';
import { usePage } from '@inertiajs/inertia-react';
import { Button } from 'react-bootstrap';

const Home = () => {
  const { props } = usePage();
  const { message } = props;

  return (
    <div>
      <h1 className={"tw-text-center"}>AttendEZ</h1>
      <h1>{message}</h1>
      <Button>Try</Button>
      
    </div>
  );
};

export default Home;
