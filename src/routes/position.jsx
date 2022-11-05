import React, {useState, useEffect} from 'react';
import "./position.css";
import Button from 'react-bootstrap/Button';
import fetchOnePosition from '../hooks/fetchOnePosition.jsx';

import {useNavigate} from 'react-router-dom';
import post from "../clients/HttpClient";


function Position (user){
    const [position, setPosition] = useState("");
    const [showForm, setShowForm] = useState(false);
    
    //console.log('user from props', user.userdata); // from props
    let userId = user.userdata.attributes.sub;
    const id = window.location.pathname.split('/')[2];
    //console.log('id', id);
    //console.log('userId', userId);
    const navigate = useNavigate();

    useEffect(() => {
      fetchOnePosition(userId, id)
        .then((data) => { setPosition(data); })
    }, []);

    console.log('position', position);

    // delete position
    const deletePost = async (e) => {
      const response = await post(
        `https://01djeb5cph.execute-api.eu-west-1.amazonaws.com/dev/delete_location`,
        JSON.stringify({id, userId})
      )
        .then(navigate('/'))
        .catch((error) => {  
          console.log('Error:', error);
        });
    }
    // modify position
    const _onCloseForm = (e) => {
      setShowForm(false);
    }
    
    const  handleChange = (e) => {
      console.log(position)
      setPosition({
        ...position,
        [e.target.name]: e.target.value,
      });
    };

    const handleSubmit = async (e) => {
      // form:  https://medium.com/weekly-webtips/a-complete-guide-to-react-forms-15fa079c6177 
      e.preventDefault();
      // Send POST request to API
      position.userId = userId;
      try {
        const response = await post(
           `https://01djeb5cph.execute-api.eu-west-1.amazonaws.com/dev/post_location_py`,
           JSON.stringify(position)
         ).catch((error) => {  
           console.log('Error:', error);
         });
         navigate('/');
        console.log('position enviar', position);
      } catch (error) {
        console.log('Error:', error);
      }
    }
    return (
      <>
      <br /><br /><br />
      {setPosition !== "" &&
      <div className='container col-lg-8 col-md-10 mx-auto' style={{maxWidth:'90%'}}>
        <div className='position-center' style={{width: '100%', maxWidth:'400px'}}>            
          <div className='position-heading'>
            <h2>{position.title}</h2>
            <br />
            <h5 className='position-subheading'>{position.description}</h5>  
          </div>
          <br />
          <div className='text-center'>
            {position.urlImg !== "" &&
            <img alt="Uploading the image." src={position.urlImg}  style={{maxWidth:'98%'}} />
            }
            <br />
            <p className='position-meta position-data'>Lat: {parseFloat(position.lat).toFixed(8)}, Long: {parseFloat(position.long).toFixed(8)}</p>
            <p className='position-meta position-createdby'>Creat al: {position.date}</p>
            <br />
            <div className='buttons-position'>
              <Button onClick={() => setShowForm(true)}  variant="warning" size='md'>&nbsp; &nbsp; Edita &nbsp;&nbsp; </Button>
              <Button onClick={() => deletePost()} variant="danger" size='md'>&nbsp; &nbsp; Elimina &nbsp; &nbsp;</Button>
            </div>
          </div>   
        {showForm === true && 
          <div className="create-form">
            <form onSubmit={handleSubmit} className="form">
            <button type="button" 
              onClick={_onCloseForm}
              style={{float: "right", paddingTop: "8px"}} 
              className="btn-close" aria-label="Close"
            ></button>
            <label className='label-form' style={{paddingTop: "8px"}}>Nou Títol</label>  
            <input
              type="text"
              name="title"  
              className="input"
              value={position.title}
              onChange={handleChange}
              required
            />
            <br />
            <label className='label-form'>Nova Descripció</label>
            <textarea
              type="text"
              name="description"
              className="input"
              rows="2"
              value={position.description}
              onChange={handleChange}
            />
               <button className='button-form' 
                //</form>onSubmit={() => handleChange()}
                >Modificar Posició</button>
            </form> 
          </div>}        
        </div>
      </div>
  }
      </>
    )
    
}

export default Position;