// @flow

import * as React from 'react';
import fetch from 'isomorphic-fetch';
import Header from '../components/Header';
import List from '../components/List';

type State = {
  loading: boolean,
  locationError: boolean,
  stores: Array<string>
};

class HomePage extends React.Component<{}, State> {
  state = {
    loading: false,
    locationError: false,
    stores: []
  };

  buttonClick = () => {
    this.setState({
      locationError: false,
      loading: true
    });

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log(latitude);
        console.log(longitude);
        fetch(`/shops?lat=${latitude}&long=${longitude}`)
          .then(response => response.json())
          .then(response => {
            console.log(response);
            this.setState({
              loading: false
            });
          });
      },
      () => {
        this.setState({
          locationError: true,
          loading: false
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 60000,
        maximumAge: 10000
      }
    );
  };

  render() {
    const { loading, locationError, stores } = this.state;
    return (
      <div>
        <Header name="Bobashops" />

        {locationError && <h1>Unable to retrieve your location.</h1>}
        {loading ? (
          <h1>Finding Stores...</h1>
        ) : (
          <div>
            <button onClick={this.buttonClick}>{locationError ? 'Retry' : 'Find Boba'}</button>
            {stores.length !== 0 && <List stores={stores} />}
          </div>
        )}
      </div>
    );
  }
}
export default HomePage;
