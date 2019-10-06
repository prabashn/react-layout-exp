import React from "react";
import { memoize } from "lodash-es";

export const GlobalLayoutContext = React.createContext();

const aliasKeysMap = {};
const getChildRef = memoize(_childKey => React.createRef(), getAliasedKey);
const getBehaviorCollectionRef = memoize(
  _childKey => React.createRef(),
  getAliasedKey
);

export const DefaultGlobalLayoutContext = {
  getChildRef,
  getBehaviorCollectionRef,
  getBehaviorContext: behaviorCollectionKey => {
    const ref = getBehaviorCollectionRef(behaviorCollectionKey);
    return ref && ref.current && ref.current.behaviorContext;
  },
  setAliasKeys: (key, aliasKeys) => {
    if (aliasKeys) {
      aliasKeys.forEach(aliasKey => {
        aliasKeysMap[aliasKey] = key;
      });
    }
  }
};

function getAliasedKey(key) {
  return aliasKeysMap[key] || key;
}
