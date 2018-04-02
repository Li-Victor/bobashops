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

const notLoggedInID = -1;

class HomePage extends React.Component<Props, State> {
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

  static defaultProps = {
    userShops: [],
    allShops: [],
    id: notLoggedInID
  };

  state = {
    loading: false,
    locationError: false,
    navigationError: false,
    nearbyStores: [],
    userShops: this.props.userShops,
    allShops: this.props.allShops
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

  getCurrentPosition = (options: {
    enableHighAccuracy: boolean,
    timeout: number,
    maximumAge: number
  }) =>
    // $FlowFixMe
    new Promise((resolve, reject) => {
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
    if (this.props.id === notLoggedInID) {
      window.localStorage.setItem('nearby', JSON.stringify(this.state.nearbyStores));
      window.location = '/login/twitter';
      return;
    }

    let response;

    if (isGoing) {
      response = await fetch(`/cancel?storeid=${storeId}&userid=${this.props.id}`, {
        method: 'DELETE'
      });
    } else {
      response = await fetch(`/gotoshop?storeid=${storeId}&userid=${this.props.id}`, {
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
      return <h1>Geolocation is not supported by your browser.</h1>;
    }

    let buttonMessage;
    if (locationError) {
      buttonMessage = <button onClick={this.findBoba}>Retry</button>;
    } else {
      buttonMessage = (
        <button onClick={this.findBoba}>
          {nearbyStores.length !== 0 ? 'Refresh Location' : 'Find Boba'}
        </button>
      );
    }

    return (
      <div>
        <Header name="Bobashops" />

        {locationError && <h1>Unable to retrieve your location.</h1>}
        {loading ? (
          <h1>Finding Nearby Open Boba Stores...</h1>
        ) : (
          <div>
            {buttonMessage}
            {nearbyStores.length !== 0 && (
              <List
                nearbyStores={nearbyStores}
                userShops={userShops}
                allShops={allShops}
                buttonClick={this.buttonClick}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}
export default HomePage;
