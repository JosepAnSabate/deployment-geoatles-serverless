
import Alert from 'react-bootstrap/Alert';

export const AlertError = ({ errors }) => {
    if (errors.length === 0) {
      return <></>;
    }
  
    return (
      <Alert variant='warning' className='error'>
        {errors.map((error) => (
          <li>{error}</li>
        ))}
      </Alert>
    );
  };