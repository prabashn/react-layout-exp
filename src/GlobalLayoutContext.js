import React from "react";
import { memoize } from "lodash-es";

const aliasKeysMap = {};

const getBehaviorCollectionRef = memoize(
  _childKey => React.createRef(),
  getAliasedKey
);

export const GlobalLayoutContext = {
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
