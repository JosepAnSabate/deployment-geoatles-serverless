export default async function fetchOnePositions(userId, id) {
    try {
      const response = await fetch(
        `https://01djeb5cph.execute-api.eu-west-1.amazonaws.com/dev/get_one_location_py?userId=${userId}&id=${id}`,
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

