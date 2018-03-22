// @flow

import * as React from 'react';

type Props = {
  loading: boolean,
  searchTerm: string
};
const List = ({ loading, searchTerm }: Props) => {
  if (loading) {
    return <div>Searching for {searchTerm}...</div>;
  }
  return <h1>List</h1>;
};
export default List;
