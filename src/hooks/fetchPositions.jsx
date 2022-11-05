import React, {useState} from 'react'
import { useEffect } from 'react';

export default async function fetchPositions(userId) {
    try {
      const response = await fetch(`https://01djeb5cph.execute-api.eu-west-1.amazonaws.com/dev/get-location-py?userId=${userId}`,
      {
        "method": 'GET',
        "headers": {  
          'Content-Type': 'application/json'
      }}
    )
      const positionsFetched = await response.json();
      //console.log(positionsFetched);
      //setPositions(positionsFetched);
      return positionsFetched;
    } catch (error) {
      console.error(error);
    }
  }