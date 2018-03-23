// @flow

import * as React from 'react';

type Props = {
  stores: Array<BobaShops>
};

const List = ({ stores }: Props) => (
  <ul>{stores.map(store => <li key={store.id}>{store.name}</li>)}</ul>
);
export default List;
