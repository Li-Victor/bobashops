// @flow

import * as React from 'react';

type Props = {
  nearByStores: Array<BobaShops>,
  userShops: Array<string>,
  allShops: Array<ShopInfo>
};

const List = ({ nearByStores, userShops, allShops }: Props) => {
  const shopMap = new Map();
  allShops.forEach(shopInfo => shopMap.set(shopInfo.bobaid, shopInfo.count));

  return (
    <ul>
      {nearByStores.map(store => (
        <li key={store.id}>
          {store.name}
          {userShops.indexOf(store.id) >= 0 && (
            <span style={{ color: 'red' }}> User is going here!</span>
          )}

          {shopMap.has(store.id) ? (
            <span style={{ color: 'green' }}> {shopMap.get(store.id)} Going.</span>
          ) : (
            <span style={{ color: 'blue' }}> 0 Going.</span>
          )}
        </li>
      ))}
    </ul>
  );
};
export default List;
