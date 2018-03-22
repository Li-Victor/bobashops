// @flow

import * as React from 'react';

type Props = {
  searchTerm: string,
  onChange: Function,
  onSubmit: Function
};

const Search = ({ searchTerm, onChange, onSubmit }: Props) => (
  <form onSubmit={onSubmit}>
    <label>
      Area:
      <input type="text" value={searchTerm} onChange={onChange} />
    </label>
    <input type="submit" value="Submit" />
  </form>
);

export default Search;
