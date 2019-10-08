import { mediator } from "./Mediator";
import { merge, cloneDeep } from "lodash-es";

const transitionState = {};

const TransitionMediatorPrefix = "transition-";
export const Transitions = {
  pub: (transitionName, state) => {
    // update persistent state map

    var curState = transitionState[transitionName];
    if (curState === state) {
      // if current state same as new, no need to do / publish anything
      return;
    }

    console.log(
      "Transitioning to name := " + transitionName + ", state := " + state
    );

    transitionState[transitionName] = state;

    // publish state change
    mediator.pub(
      TransitionMediatorPrefix + transitionName,
      // arguments are (1) transition name, (2) state (true/false)
      transitionName,
      state
    );

    console.log("Transitioned state := " + JSON.stringify(transitionState));
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
      // get the state that was published
      const publishedValue = transitionState[transitionName];

      // if state is truthy, process it
      if (publishedValue) {
        // deep-copy the base config before we start merging
        if (!mergedConfig) {
          mergedConfig = cloneDeep(baseConfig);
        }

        // by default assume it's a boolean flag - so use the immediate state value as override
        let overrideState = transitionConfig[transitionName];

        // if the published state is a string, then treat it as a sub-state, so
        // get the actual override state from the super state we got above.
        if (typeof publishedValue === "string") {
          overrideState = overrideState[publishedValue];
        }

        if (overrideState) {
          merge(mergedConfig, overrideState);
        }
      }
    }

    // return the merged config (if any transitions were applied),
    // or the original base config otherwise.
    return mergedConfig || baseConfig;
  }
};
