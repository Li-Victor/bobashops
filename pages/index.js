// @flow

import * as React from 'react';
import Header from '../components/Header';
import List from '../components/List';
import Search from '../components/Search';

type State = {
  searchTerm: string,
  loading: boolean
};

class HomePage extends React.Component<{}, State> {
  state = {
    searchTerm: '',
    loading: false
  };

  handleChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      searchTerm: event.currentTarget.value
    });
  };

  handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setState({
      loading: true
    });

    // search request
    setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 1000);
  };

  render() {
    const { searchTerm, loading } = this.state;
    return (
      <div>
        <Header name="Bobashops" />
        <Search searchTerm={searchTerm} onChange={this.handleChange} onSubmit={this.handleSubmit} />
        <List loading={loading} searchTerm={searchTerm} />
      </div>
    );
  }
}
export default HomePage;
