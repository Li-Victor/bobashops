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
  nearByStores: Array<BobaShops>,
  navigationError: boolean,
  userShops: Array<string>,
  allShops: Array<ShopInfo>
};

class HomePage extends React.Component<Props, State> {
  static async getInitialProps({ req }: any) {
    let response;
    if (req.user) {
      response = await fetch(`http://127.0.0.1:3000/init?id=${req.user.id}`);
      response = await response.json();
    } else {
      response = await fetch('http://127.0.0.1:3000/init');
      response = await response.json();
    }
    return response;
  }

  static defaultProps = {
    userShops: [],
    allShops: [],
    id: 0
  };

  state = {
    loading: false,
    locationError: false,
    navigationError: false,
    nearByStores: [],
    userShops: this.props.userShops,
    allShops: this.props.allShops
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
      const nearByStores = await response.json();
      this.setState({
        loading: false,
        nearByStores
      });
    } catch (error) {
      this.setState({
        locationError: true,
        loading: false
      });
    }
  };

  render() {
    const { loading, locationError, nearByStores, navigationError } = this.state;
    const { userShops, allShops, id } = this.props;

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
            <button onClick={this.findBoba}>{locationError ? 'Retry' : 'Find Boba'}</button>
            {nearByStores.length !== 0 && (
              <List nearByStores={nearByStores} userShops={userShops} allShops={allShops} />
            )}
          </div>
        )}
      </div>
    );
  }
}
export default HomePage;
