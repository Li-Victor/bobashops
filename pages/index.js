// @flow

import * as React from 'react';
import fetch from 'isomorphic-fetch';
import Header from '../components/Header';
import List from '../components/List';

type Props = {
  userShops: Array<string>,
  allShops: Array<ShopInfo>,
  id: number
};

type State = {
  loading: boolean,
  locationError: boolean,
  nearbyStores: Array<BobaShops>,
  navigationError: boolean,
  userShops: Array<string>,
  allShops: Array<ShopInfo>
};

function buttonMessage(locationError: boolean, nearbyStores: Array<BobaShops>): string {
  if (locationError) return 'Retry';
  return nearbyStores.length !== 0 ? 'Refresh Location' : 'Find Boba';
}

class HomePage extends React.Component<Props, State> {
  state = {
    loading: false,
    locationError: false,
    navigationError: false,
    nearbyStores: [],
    userShops: (() => {
      const { userShops } = this.props;
      return userShops || [];
    })(),
    allShops: (() => {
      const { allShops } = this.props;
      return allShops || [];
    })()
  };

  componentDidMount() {
    const stores = JSON.parse(window.localStorage.getItem('nearby'));
    window.localStorage.removeItem('nearby');
    if (stores) {
      this.setState({
        nearbyStores: stores,
        locationError: !('geolocation' in window.navigator)
      });
    }
  }

  static async getInitialProps({ req }: any) {
    let response;
    const domain = process.env.DOMAIN || '127.0.0.1:3000';
    if (req.user) {
      response = await fetch(`${domain}/init?id=${req.user.id}`);
      response = await response.json();
    } else {
      response = await fetch(`${domain}/init`);
      response = await response.json();
    }
    return response;
  }

  getCurrentPosition = (options: {
    enableHighAccuracy: boolean,
    timeout: number,
    maximumAge: number
  }) => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

  findBoba = async () => {
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
      const nearbyStores = await response.json();
      this.setState({
        loading: false,
        nearbyStores
      });
    } catch (error) {
      this.setState({
        locationError: true,
        loading: false
      });
    }
  };

  buttonClick = async (isGoing: boolean, storeId: string) => {
    const { id } = this.props;
    const { nearbyStores } = this.state;
    if (!id) {
      window.localStorage.setItem('nearby', JSON.stringify(nearbyStores));
      window.location = '/login/twitter';
      return;
    }

    let response;

    if (isGoing) {
      response = await fetch(`/cancel?storeid=${storeId}&userid=${id}`, {
        method: 'DELETE'
      });
    } else {
      response = await fetch(`/gotoshop?storeid=${storeId}&userid=${id}`, {
        method: 'POST'
      });
    }

    response = await response.json();
    const { userShops, allShops } = response;
    this.setState({
      userShops,
      allShops
    });
  };

  render() {
    const {
      loading,
      locationError,
      nearbyStores,
      navigationError,
      userShops,
      allShops
    } = this.state;

    if (navigationError) {
      return (
        <h1>
          Geolocation is not supported by your browser.
        </h1>
      );
    }

    return (
      <React.Fragment>
        <Header name="Bobashops" />

        {locationError && (
        <h1>
          Unable to retrieve your location.
        </h1>
        )}
        {loading ? (
          <h1>
            Finding Nearby Open Boba Stores...
          </h1>
        ) : (
          <React.Fragment>
            <button type="button" onClick={this.findBoba}>
              {buttonMessage(locationError, nearbyStores)}
            </button>
            {nearbyStores.length !== 0 && (
              <List
                nearbyStores={nearbyStores}
                userShops={userShops}
                allShops={allShops}
                buttonClick={this.buttonClick}
              />
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
export default HomePage;
