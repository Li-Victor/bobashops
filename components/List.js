// @flow

import * as React from 'react';

type Props = {
  nearbyStores: Array<BobaShops>,
  userShops: Array<string>,
  allShops: Array<ShopInfo>,
  buttonClick: Function
};

const List = ({ nearbyStores, userShops, allShops, buttonClick }: Props) => {
  const shopMap = new Map();
  allShops.forEach(shopInfo => shopMap.set(shopInfo.bobaid, shopInfo.count));

  return (
    <ul>
      {nearbyStores.map(store => {
        const isGoing = userShops.indexOf(store.id) >= 0;
        return (
          <li key={store.id}>
            {store.name}
            <button
              style={
                isGoing
                  ? { color: 'red', backgroundColor: 'lightgreen' }
                  : { color: 'buttontext', backgroundColor: 'buttonface' }
              }
              onClick={() => buttonClick(isGoing, store.id)}
            >
              {shopMap.has(store.id) ? `${shopMap.get(store.id)} Going.` : '0 Going.'}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
export default List;
