import { useMap, useMapEvents  } from "react-leaflet";
import * as WMS from "leaflet.wms";
import {useEffect, useState} from 'react';

function CustomWMSLayerOutside(props) {
    const [mouseClick, setMouseClick] = useState({});
    const map = useMapEvents({
        click: (e) => {
          const { lat, lng } = e.latlng;
          //console.log('latlng', lat, lng);
          setMouseClick({lat,lng});
        }
      });
      console.log("mouseClick",mouseClick);
    // const { url, options,layers } = props;
    // const map = useMap()

    // useEffect(() => {
    // // Add WMS source/layers
    // let source = WMS.source(
    //     url,
    //     options
    // );
    // console.log("source",source);
    // for(let name of layers){
    //     source.getLayer(name).addTo(map)
    //     source.setOpacity(1)
    // }
    // console.log("CustomWMSLayer",map)
    // }, [])
    return null;
}

export default CustomWMSLayerOutside;