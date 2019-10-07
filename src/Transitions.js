import { mediator } from "./Mediator";
import { merge, cloneDeep } from "lodash-es";

const transitionState = new Map();

const TransitionMediatorPrefix = "transition-";
export const Transitions = {
  pub: (transitionName, state) => {
    // update persistent state map
    if (state) {
      transitionState.set(transitionName, state);
    } else {
      transitionState.delete(transitionName);
    }

    // publish state change
    mediator.pub(
      TransitionMediatorPrefix + transitionName,
      // arguments are (1) transition name, (2) state (true/false)
      transitionName,
      state
    );
  },
  unsub: (transitionName, callback) => {
    mediator.unsub(TransitionMediatorPrefix + transitionName, callback);
  },
  sub: (transitionName, callback) => {
    mediator.sub(TransitionMediatorPrefix + transitionName, callback);
  },
  getConfig: (baseConfig, transitionConfig) => {
    var mergedConfig;

    for (let transitionName in transitionConfig) {
      if (transitionState.get(transitionName)) {
        // deep-copy the base config before we start merging
        if (!mergedConfig) {
          mergedConfig = cloneDeep(baseConfig);
        }

        const transition = transitionConfig[transitionName];
        merge(mergedConfig, transition);
      }
    }

    // return the merged config (if any transitions were applied),
    // or the original base config otherwise.
    return mergedConfig || baseConfig;
  }
};
