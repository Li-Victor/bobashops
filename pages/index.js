// @flow

import * as React from 'react';
import fetch from 'isomorphic-fetch';
import Header from '../components/Header';
import List from '../components/List';

type State = {
  loading: boolean,
  locationError: boolean,
  stores: Array<BobaShops>,
  navigationError: boolean
};

class HomePage extends React.Component<{}, State> {
  state = {
    loading: false,
    locationError: false,
    navigationError: false,
    stores: []
  };

  getCurrentPosition = (options: {
    enableHighAccuracy: boolean,
    timeout: number,
    maximumAge: number
  }) =>
    // $FlowFixMe
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  buttonClick = async () => {
    this.setState({
      locationError: false,
      loading: true
    });

    try {
      const position = await this.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 60000,
        maximumAge: 10000
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(`/shops?lat=${latitude}&long=${longitude}`);
      const stores = await response.json();
      this.setState({
        loading: false,
        stores
      });
    } catch (error) {
      this.setState({
        locationError: true,
        loading: false
      });
    }
  };

  render() {
    const { loading, locationError, stores, navigationError } = this.state;

    if (navigationError) {
      return <h1>Geolocation is not supported by your browser.</h1>;
    }

    return (
      <div>
        <Header name="Bobashops" />

        {locationError && <h1>Unable to retrieve your location.</h1>}
        {loading ? (
          <h1>Finding Open Boba Stores...</h1>
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
