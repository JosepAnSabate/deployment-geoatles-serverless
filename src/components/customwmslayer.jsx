import { useMap, useMapEvents  } from "react-leaflet";
import * as WMS from "leaflet.wms";
import {useEffect, useState} from 'react';
import $ from 'jquery';

function CustomWMSLayer(props) {
    const { url, options,layers, setGetInfo } = props;
    const map = useMap()

    
    useEffect(() => {
    // Add WMS source/layers
     let source = WMS.source(
          url,
          options
      );
    //  console.log("source",source);

    // for(let name of layers){
    //      source.getLayer(name).addTo(map)
    // //     source.setOpacity(1)
    //  }
    // console.log("CustomWMSLayer",map)
    // var MySource = WMS.Source.extend({
    //     ajax: function (url, callback) {
    //       $.ajax(url, {
    //         context: this,
    //         success: function (result) {
    //           callback.call(this, result);
    //         },
    //       });
    //     },
    //     showFeatureInfo: function (latlng, info) {
    //       setGetInfo(info);
    //     },
    //   });
    //   new MySource(url, options).getLayer(layers).addTo(map);
    }, [])

    //console.log("getInfo",typeof getInfo, getInfo);


    return null;
}

export default CustomWMSLayer;