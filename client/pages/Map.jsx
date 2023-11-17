import React, { useEffect, useRef, useState, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { Button } from '@mui/material';
import { UserContext } from '../components/UserProvider';

import EventTable from '../components/EventTable';

mapboxgl.accessToken = 'pk.eyJ1IjoiZXZtYXBlcnJ5IiwiYSI6ImNsb3hkaDFmZTBjeHgycXBpNTkzdWdzOXkifQ.BawBATEi0mOBIdI6TknOIw';

const Marker = ({ onClick, children, event, index }) => {
  const _onClick = () => {
    onClick(event.title);
  };
  console.log('Marker', event, index);
  return (
    <button onClick={_onClick} className="marker" style={{
      backgroundColor: 'black',
      border: '1px solid gold',
      color: 'white',
      padding: '3px',
      textAlign: 'center',
      display: 'inline-block',
      fontSize: '20px',
      margin: '1px',
      borderRadius: '50%',
    }}
    >
      {/* {children} */}
      {index + 1}
    </button>
  );
};

const Map = () => {
  // what happens when map marker is clicked
  const markerClicked = (title) => {
    window.alert(title);
  };

  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const [events, setEvents] = useState([]);
  const [currentMarkers, setCurrentMarkers] = useState([]);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [zoom, setZoom] = useState(9);
  const { activeUser, setActiveUser } = useContext(UserContext);

  useEffect(() => {
    // check if map exists; only init once
    // if (map.current) return;
    console.log('activeUser', activeUser)
    // initialize map
    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom,
    });

    // get all events
    async function getEvents() {
      const eventsResponse = await axios.get('/api/event/all');
      setEvents(eventsResponse.data);
      return eventsResponse.data;
    }

    // run map logic based on getting events
    getEvents()
      .then((eventsArray) => {
        console.log('eventsArray', eventsArray);
        // Calculate and set longitude and latitude state
        centerMap(eventsArray);

        // Add marker to map for each event in events table
        eventsArray.forEach((event, index) => {
          addEventToMap(event, index);
        });
      });


    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    // Add user geolocation control
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true,
      showUserLocation: true,
    }));

    // Clean up on unmount
    // return () => map.remove();
  }, []);

  function centerMap(eventsArray) {
    const latitudes = [];
    const longitudes = [];

    eventsArray.forEach((event) => {
      if (event.long !== 0 && event.lat !== 0 && event.isInPerson === true) {
        latitudes.push(event.lat);
        longitudes.push(event.long);
      }
    });

    const avgLatitude = latitudes.reduce((acc, cur) => acc + cur, 0) / latitudes.length;
    setLatitude(avgLatitude);

    const avgLongitude = longitudes.reduce((acc, cur) => acc + cur, 0) / longitudes.length;
    setLongitude(avgLongitude);
    console.log('AVG', avgLatitude, avgLongitude);
    map.current.flyTo({ center: [avgLatitude, avgLongitude] });
  }

  function addEventToMap(event, index) {
    if (event.lat !== 0 && event.long !== 0 && event.isInPerson === true) {
      const ref = React.createRef();
      ref.current = document.createElement('div');
      // Render a Marker on new DOM node
      createRoot(ref.current).render(
        <Marker onClick={markerClicked} event={event} index={index} />
      );
      // Create a Mapbox Marker at our new DOM node
      const marker = new mapboxgl.Marker(ref.current)
        .setLngLat([event.lat, event.long])
        .addTo(map.current);

      setCurrentMarkers((prevMarkers) => [...prevMarkers, marker])
    }
  }

  function removeMarkerFromMap(marker) {
    marker.remove();
  }

  function removeAllMarkers() {
    currentMarkers.forEach((marker) => removeMarkerFromMap(marker));
    setCurrentMarkers([]);
  }

  function flyToCoordinates(lat, lng) {
    console.log('flying');
    map.current.flyTo({ center: [lat, lng] });
  }

  function sortMarkersByAttendee(username) {
    // for single user
    if (username) {
      const userEvents = events.filter((event) => {
        return event.selectedUsers.includes(username);
      });
      removeAllMarkers();

      userEvents.forEach((event, index) => addEventToMap(event, index));
    }
    // for all users
    else {
      removeAllMarkers();
      events.forEach((event, index) => { addEventToMap(event, index); });
    }
  }

  console.log('STATE', events, currentMarkers, activeUser);
  return (
    <div>
      <Button style={{ margin: '5px' }} variant="contained" onClick={() => sortMarkersByAttendee()}>Pin All Events</Button>
      <Button style={{ margin: '5px' }} variant="contained" onClick={() => sortMarkersByAttendee(activeUser.username)}>Pin My Events</Button>
      <EventTable events={events} flyToCoordinates={flyToCoordinates} />
      <div className="map-container" ref={mapContainerRef} style={{ position: 'absolute', top: '400px', bottom: '0', left: '0', right: '0' }} />
    </div>
  );
};

export default Map;

