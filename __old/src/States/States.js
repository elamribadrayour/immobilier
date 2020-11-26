import React from 'react';

export const useSemiPersistentState = (key, initialState) =>
{
  const [value, setValue] = React.useState(initialState);
  // React.useEffect(() => { localStorage.setItem(key, value); }, [value, key]);    
  return [value, setValue];
}
