import React from 'react';
import {useNavigate, Link} from 'react-router-dom';
import ReactDOMServer from "react-dom/server";
import * as AWS from 'aws-sdk'
//import { uploadFile } from 'react-s3';
import {MapContainer, TileLayer, Marker, Popup, FeatureGroup, useMapEvents, LayersControl, useMap } from 'react-leaflet';
import * as WMS from "leaflet.wms";
import {EditControl} from 'react-leaflet-draw';
//import {Icon} from 'leaflet';
import { useState, useEffect } from 'react';
import "./home.css";
//import { layer } from '@fortawesome/fontawesome-svg-core';
import osm from '../osm-provider';
import * as L from 'leaflet';
import "leaflet-draw/dist/leaflet.draw.css"
import $ from 'jquery';

import post from "../clients/HttpClient";
// hooks
import fetchPositions from '../hooks/fetchPositions.jsx';
import useGeoLocation from '../hooks/useGeoLocation';

// utils
//import { mapForm } from '../utils/mapForm.js';
// components
import CustomWMSLayer from '../components/customwmslayer.jsx';


const { BaseLayer } = LayersControl;

const markerIcon = new L.icon({
  iconUrl: require('../img/location.png'),
  iconSize: [40, 41],
})


function Home (user){
    //console.log('user',user.userdata.username);
    const userId = user.userdata.username
    const [positions, setPositions] = useState("");

    useEffect(() => {
      fetchPositions(userId)
        .then((data) => { setPositions(data); })
        //.then(console.log('fetched'))
    }, []);
    
    // building the geogson a partir de dynamodb data
    const data ={
      "type": "FeatureCollection",
      "features": []
    };
    
    for (let i = 0; i < positions.Count; i++) {
      data.features.push({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            parseFloat(positions.Items[i].lat), parseFloat(positions.Items[i].long)
          ]
        },
        "properties": {
          "id": positions.Items[i].id,
          "title": positions.Items[i].title,
          "description": positions.Items[i].description,
          "urlImg": positions.Items[i].urlImg,
          "date": positions.Items[i].date,
          "lat": positions.Items[i].lat,
          "long": positions.Items[i].long,
        }
      });
    }
    
    const [center, setCenter] = useState({lat: 41.505, lng: 1.834});
    // user location
    let location = useGeoLocation();  // REVISAR!!!
    //console.log('location', location);

    //console.log('items', positions.Items);
    //console.log('items 0', positions.Items[0].location);
    //console.log('data', data);

    /// POST ///
    //https://javascript.plainenglish.io/how-to-upload-files-to-aws-s3-in-react-591e533d615e
    const accessKeyId = process.env.REACT_APP_ACCESS_KEY_ID;
    const secretAccessKey = process.env.REACT_APP_SECRETACCESSKEY;
    const s3BucketImg = process.env.REACT_APP_S3_BUCKET_IMG;
    
    AWS.config.update(
        {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey, 
        region: 'eu-west-1'
    })

    const myBucket = new AWS.S3({
        params: { Bucket: s3BucketImg},
        region: 'eu-west-1',
    })
    
    const initialFormData = {
        title: '',
        description: '',
        urlImg: '',
      };

    const [formData, setFormData] = useState(initialFormData);
    const [formSuccess, setFormSuccess] = useState('');
    const [formErrors, setFormErrors] = useState([]);

    // show or not form
    const [showForm, setShowForm] = useState();

    // S3
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileInput = (e) => {
        setSelectedFile(e.target.files[0]);
        formData.urlImg = userId + '/' + e.target.files[0].name;
    }    
    //console.log('selectedFile', selectedFile);
    // for redirecting to the home page
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        // form:  https://medium.com/weekly-webtips/a-complete-guide-to-react-forms-15fa079c6177 
        e.preventDefault();
        try {
          // Send POST request
          //await axios.post('http://localhost:5000/api/v1/person', formData);
          //console.log('formData', formData);
          const date = new Date()
          const day = date.getDate();
          const month = date.getMonth() + 1; // getMonth() returns month from 0 to 11
          const year = date.getFullYear();
          formData.date = `${day}/${month}/${year}`; 
          formData.userId = userId;
          formData.lat = mapPoint.latlngs.lat.toString();
          formData.long = mapPoint.latlngs.lng.toString();
 
          console.log('formData', formData);
          const response = await post(
            `https://01djeb5cph.execute-api.eu-west-1.amazonaws.com/dev/post_location_py`,
            JSON.stringify(formData)
          ).catch((error) => {  
            setFormSuccess('Format de les coordenades no vàlid.');
          });
          const data = await response.data;
          console.log('dataf', data);  
          const direction = '/position/' + data.id;
          //console.log('file', selectedFile); 
          // S3 if image is uploaded
          if (formData.urlImg !== '') {
            const params = {
              ACL: 'public-read',
              Body: selectedFile,
              Bucket: 'geoatles-serverless-images',
              Key: formData.urlImg,
            };
            console.log('params', params);
            myBucket.putObject(params)
              .send((err) => {
                  if (err) console.log(err)
              });
            
          }

          // HTTP req successful
          setFormSuccess('Data received correctly');
    
          // Reset form data
          setFormData(initialFormData);
          
          setShowForm(false);
          navigate(direction);
          //setTimeout(window.location.reload(false), 2000);
          //return data;
        } catch (err) {
          handleErrors(err);
        }
      };
    
    const handleErrors = (err) => {
      if (err.response.data && err.response.data.errors) {
        // Handle validation errors
        const { errors } = err.response.data;
  
        let errorMsg = [];
        for (let error of errors) {
          const { msg } = error;
  
          errorMsg.push(msg);
        }
  
        setFormErrors(errorMsg);
      } else {
        // Handle generic error
        setFormErrors(['Oops, there was an error!']);
      }
    };
    
    const  handleChange = (e) => {
      console.log(formData)
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      setFormErrors([]);
      setFormSuccess('');
    };

    // react leaflet post
    const [mapPoint, setMapPoint] = useState([]);
    const _onCreated = (e) => {
      //console.log('created', e);
      const {layerType, layer} = e;

      const {_leaflet_id } = layer;
      //console.log('ltlng', layer._latlng);
      const {lat, lng} = layer._latlng;
      // setMapPoint(layers => [...layers, {id: _leaflet_id, latlngs: layer._latlng} ]);
      setMapPoint({id: _leaflet_id, latlngs: layer._latlng});
      
      formData.lat = lat.toString();
      console.log('long', lng);
      formData.long = lng.toString();
      setShowForm(true);
      // try {
      //   layer.bindPopup(
      //     mapForm,{
      //     keepInView: true,
      //     closeButton: false
      //     }).openPopup();
      // } catch (error) {
      //   console.error(error);
      // }
    }

    // const _onEdited = (e) => {
    //   console.log('edited', e);
    // }
    // close form
    const _onDeleted = (e) => {
      //console.log('deleted', e);
      setShowForm(false);
    }

    // track coordinates
    const [mousePosition, setMousePosition] = useState({});
    //  function MouseMoveCoordinates() {
    //     const map  = useMapEvents({
    //       mousemove: (e) => {
    //       const { lat, lng } = e.latlng;
    // //       //console.log('latlng', lat, lng);
    //        setMousePosition({lat,lng});
    //       }
    //     });
    //     return null;
    //   }
    //console.log('mousePosition', mousePosition);
    // getFeatureInfo
    const [getInfo, setGetInfo] = useState(false);
    function GetFeatureInfo(props) {
      const { url, options,layers } = props;
      const map = useMap()
      
      useEffect(() => {
        let MySourceWMS = WMS.Source.extend({
            ajax: function (url, callback) {
              $.ajax(url, {
                context: this,
                success: function (result) {
                  callback.call(this, result);
                },
              });
            },
            showFeatureInfo: function (latlng, info) {
              setGetInfo(info);
              //console.log('latlng', latlng);
              //$('.geologicDescription').text(info);
              // const { lat, lng } = latlng;
              // setMousePosition({lat,lng});
            },
            onRemove: function() {
              let evitabug = 3;
          },       
          });
        new MySourceWMS(url, options).getLayer(layers).addTo(map)//.bringToBack();
      }, [])
     
    //console.log("getInfo",typeof getInfo, getInfo);
    return null;
    }
    
    
    return (
    <>
      {/* <h2>Hello {user.userdata.username}</h2> */}
      {showForm === true && 
        <div className="create-form">
          <form onSubmit={handleSubmit} className="form">
          <button type="button" onClick={_onDeleted} style={{float: "right", paddingTop: "8px"}} className="btn-close" aria-label="Close"></button>
            <label className='label-form' style={{paddingTop: "8px"}}>Títol</label>  
            <input
              type="text"
              name="title"  
              className="input"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <br />
            <label className='label-form'>Descripció</label>
            <textarea
              type="text"
              name="description"
              className="input"
              rows="2"
              value={formData.description}
              onChange={handleChange}
            />
            <br />
            <label className='label-form'>Imatge</label>
            <input
              type="file"
              name="urlImg"
              className="input"
              onChange={handleFileInput}
             // onChange={handleFileChange}
            />
            <br />
            <label className='form-coords'>Lat: {mapPoint.latlngs.lat.toFixed(6)}, Long: {mapPoint.latlngs.lng.toFixed(6)}</label>
            <br />
            <button className='button-form' onSubmit={() => handleChange()}>Afegeix Posició</button>

          </form>
        </div>
      }
      {/* <pre className="text-left">{JSON.stringify(mapPoint, 0, 2)}</pre> */}
      <MapContainer center={center}
         zoom={8} scrollWheelZoom={true}>
        <LayersControl position="topright">
         {/* osm leaflet default   */}
        <BaseLayer checked name="Topogràfic">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          /> 
        </BaseLayer>
        <BaseLayer name="Ortofoto">
          <TileLayer 
            url={osm.maptiler.url} attribution={osm.maptiler.attribution} 
          />
        </BaseLayer>
        <BaseLayer name="Geològic">
          <TileLayer 
            url={'https://tilemaps.icgc.cat/mapfactory/wmts/geologia/MON3857NW/{z}/{x}/{y}.png'} attribution={'ICGC, Catalunya'} 
          />
        </BaseLayer>
        </LayersControl> 
        {location.loaded && !location.error && (
          <Marker position={[location.coordinates.lat, location.coordinates.lng]} icon={markerIcon}>
            <Popup>
              <div className='my-position'>
              <p>La Meva Posició</p>
              <p>Latitud: {location.coordinates.lat} Longitud:{location.coordinates.lng}</p>
              </div>
            </Popup>
          </Marker>
        )}
        <FeatureGroup>
          <EditControl 
            onCreated={_onCreated}
            position='topright' 
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              polyline: false,
              polygon: false,
              marker: true,
            }}
          />
        </FeatureGroup>
        {data.features.map(position => (
          <Marker 
            key={position.properties.id} 
            position={position.geometry.coordinates}
            // icon={markerIcon} // customized marker
          > 
          <Popup>
          <div>
            <Link to={'/position/' + position.properties.id}>
              <h2 className='title-popup'>{position.properties.title}</h2>
            </Link>
            <hr style={{margin:'3px', marginBottom:'22px'}} />
            <img className='img-popup' src={position.properties.urlImg} width="300"/> 
            <p className='descr-popup'>{position.properties.description}</p>
            <p className='date-popup'>{position.properties.date}</p>
            <p className='coords-popup'>Lat: {parseFloat(position.properties.lat).toFixed(5)}, Long: {parseFloat(position.properties.long).toFixed(5)}</p>
            
          </div>
        </Popup>
        </Marker>
          ))
        } 
        {/* <MouseMoveCoordinates />  */}
        {/* <CustomWMSLayerOutside /> */}
        {/* GETFEATURESINFO https://github.com/heigeo/leaflet.wms
        EXEMPLE https://stackblitz.com/edit/react-7nhob4?file=package.json,CustomWMSLayer.js,index.js
        */}
        {/* <CustomWMSLayer
        setGetInfo={setGetInfo}
        layers={['UGEO_PA']}
        options={{
          "format": "image/png",
          "transparent": "true",
          "info_format": "text/plain",
        }}
        url="https://geoserveis.icgc.cat/arcgis/services/geologic/icgc_mg50m/MapServer/WMSServer"
      />    */}
      <GetFeatureInfo
        layers={['UGEO_PA']}
        options={{
          "format": "image/png",
          "transparent": true,
          "info_format": "text/plain",
          "maxZoom": 7// avoid show wms on the map
        }}
        url="https://geoserveis.icgc.cat/arcgis/services/geologic/icgc_mg50m/MapServer/WMSServer"
      />  
      
      </MapContainer>
      {/* {"lat" in mousePosition && 
      <> 
      <p className='coords-map'>Lat: {mousePosition.lat.toFixed(5)}, Long: {mousePosition.lng.toFixed(5)}</p><br /><br />
      </>} */}
      {/* <pre className="geologicDescription" id="geologicDescription">Clica al mapa per obtenir descripcions litològiques.</pre> */}
        {/* https://geoserveis.icgc.cat/arcgis/services/geologic/icgc_mg50m/MapServer/WMSServer?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=UGEO_PA&SRS=EPSG%3A4326&BBOX=-0.010939%2C40.315513%2C3.502894%2C43.069009&WIDTH=256&HEIGHT=256&QUERY_LAYERS=UGEO_PA&X=100&Y=100&INFO_FORMAT=text%2Fplain */}
      {getInfo ? (
      <>
      <br />
      <table className="table">
        <tbody>
          <tr>
            <th scope="row" className='left-table'>Codi:</th>
            <td className="leftTabEl">{getInfo.split(';')[12]}</td>
          </tr>
          <tr>
            <th className='left-table' scope="row">Classificació litològica: </th>
            <td className="leftTabEl">{getInfo.split(';')[13]}</td>
          </tr>
          <tr>
          <th className='left-table' scope="row">Descripció: </th>
          <td className="leftTabEl">{getInfo.split(';')[14]}</td>
        </tr>
        <tr>
          <th className='left-table' scope="row">Època: </th>
          <td className="leftTabEl">{getInfo.split(';')[15]}</td>
        </tr>
        <tr>
          <th className='left-table' scope="row">Era: </th>
          <td className="leftTabEl">{getInfo.split(';')[16]}</td>
        </tr>
        <tr>
          <th className='left-table' scope="row">Període: </th>
          <td className="leftTabEl">{getInfo.split(';')[17]}</td>
        </tr>
        </tbody>
      </table>
      </>
      ) : 
      <>
      <p className='coords-map'>Clica al mapa per obtenir la descripció litològica.</p>
      <p className='coords-map'>Clica a &nbsp;
        <img className='img-popup' src={'https://geoatles-serverless-images.s3.eu-west-1.amazonaws.com/Captura.PNG'} width="40"/> 
        &nbsp; per a crear una nova posició.</p>
      </>
      } 
      <div className="col-lg-8 col-md-10 mx-auto">
      <br />
      <hr />
      </div>
      {location.loaded && !location.error && (
          data.features.map(position => (
          <div className='post-preview col-lg-8 col-md-10 mx-auto' key={position.properties.id}>
            <div className='post-preview-img'>
            {/* <a href={'/position/' + position.properties.id}> Nooooo! react!!!*/}
            <Link to={'/position/' + position.properties.id}>
              <h3 className='post-title'>{position.properties.title}</h3>
            </Link>  
            <h5 className='post-subtitle'>{position.properties.description}</h5>
            </div>
            <p className='post-meta date-format'>Creat al {position.properties.date}</p>
            <hr />
          </div>
          ))
        )}
    </>
    )
    
}
  
export default Home;