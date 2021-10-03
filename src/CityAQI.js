import React, { useState, useEffect } from 'react';
import moment from 'moment';

const CityAQI = () => {
  const [aqiData, setAqiData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [timeAgoData, setTimeData] = useState([]);

  const cityPair = 'cityaqi';

  useEffect(() => {
    const subscribe = {
      event: 'city',
      data: {
        channel: `city_aqi_${cityPair}`,
      },
    };
    const ws = new WebSocket('ws://city-ws.herokuapp.com');

    ws.onopen = () => {
      ws.send(JSON.stringify(subscribe));
    };
    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      console.log('response fetched: ', response);
      const [parsedData] = parseData(response);
      setCityData(parsedData[0]);
      setAqiData(parsedData[1]);
      setTimeData(parsedData[2]);
    };
    ws.onclose = () => {
      ws.close();
    };

    return () => {
      ws.close();
    };
  });

  //   helper function to generate aqi level indicators
  const getAqiIndicator = (aqi) => {
    if (Math.ceil(aqi) >= 0 && Math.ceil(aqi) <= 50) {
      return 'good';
    } else if (Math.ceil(aqi) >= 51 && Math.ceil(aqi) <= 100) {
      return 'satisfactory';
    } else if (Math.ceil(aqi) >= 101 && Math.ceil(aqi) <= 200) {
      return 'moderate';
    } else if (Math.ceil(aqi) >= 201 && Math.ceil(aqi) <= 300) {
      return 'poor';
    } else if (Math.ceil(aqi) >= 301 && Math.ceil(aqi) <= 400) {
      return 'very-poor';
    } else if (Math.ceil(aqi) >= 401 && Math.ceil(aqi) <= 500) {
      return 'severe';
    }
  };

  // helper function to get cities and their respective aqi
  const parseData = (data) => {
    const cities = [...cityData];
    const aqis = [...aqiData];
    const timestamps = [...timeAgoData];
    return data.map((pair) => {
      console.log('pair', pair);
      console.log('current city data: ', cities);
      console.log('city to search', pair.city);
      const cityIndex = cities.indexOf(pair.city);
      console.log('city index: ===>', cityIndex);
      if (cityIndex === -1) {
        console.log('not found');
        console.log('add this data to current data');
        cities.push(pair.city);
        aqis.push(pair.aqi.toFixed(2));
        timestamps.push(moment.now());
        setCityData((cityData) => [...cityData, pair.city]);
        setAqiData((aqiData) => [...aqiData, pair.aqi.toFixed(2)]);
        setTimeData((timeAgoData) => [...timeAgoData, moment.now()]);
      } else if (cityIndex !== -1) {
        console.log('found');
        console.log('update aqi and time stamp for this city');
        aqis[cityIndex] = pair.aqi.toFixed(2);
        setAqiData(aqis);
        timestamps[cityIndex] = moment.now();
        setTimeData(timestamps);
      }
      return [cities, aqis, timestamps];
    });
  };

  const serialRows = (arr) =>
    arr &&
    arr.map((item, index) => (
      <tr key={index}>
        <td> {index + 1} </td>
      </tr>
    ));

  const cityRows = (arr) =>
    arr &&
    arr.map((item, index) => (
      <tr key={index} className={getAqiIndicator(item)}>
        <td>{item}</td>
      </tr>
    ));

  const aqiRows = (arr) =>
    arr &&
    arr.map((item, index) => (
      <tr key={index} className={getAqiIndicator(item)}>
        <td> {item} </td>
      </tr>
    ));

  const timeRows = (arr) =>
    arr &&
    arr.map((item, index) => (
      <tr key={index}>
        <td> {moment(item).fromNow()} </td>
      </tr>
    ));
  const heading = (title) => (
    <thead>
      <tr>
        <th>{title}</th>
      </tr>
    </thead>
  );
  return (
    <div className='app-container'>
      <div className='aqiDataTable'>
        <table className='serialCol'>
          {heading('No.')}
          <tbody>{serialRows(cityData)}</tbody>
        </table>
        <table className='cityCol'>
          {heading('City')}
          <tbody>{cityRows(cityData)}</tbody>
        </table>
        <table className='aqiCol'>
          {heading('AQI')}
          <tbody>{aqiRows(aqiData)}</tbody>
        </table>
        <table className='timestampCol'>
          {heading('Last Updated')}
          <tbody>{timeRows(timeAgoData)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default CityAQI;
