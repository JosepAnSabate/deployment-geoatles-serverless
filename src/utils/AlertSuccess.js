import Alert from 'react-bootstrap/Alert';


export const AlertSuccess = ({ success }) => {
    if (success === '') {
      return <></>;
    }
    
    return <Alert variant="info" className='info'>{success}</Alert>;
  };