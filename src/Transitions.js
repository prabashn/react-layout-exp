import { mediator } from "./Mediator";
import { merge, cloneDeep } from "lodash-es";
import { Viewport } from "./Viewport";
import { WeakMapEx } from "./WeakMapEx";
import { ArrayMap } from "./mapHelpers";

// Map of current transition state keys and values
const transitionState = {};

// Map of transition names to array of transition groups
const transitionNamesToGroupMap = new ArrayMap();

const TransitionMediatorPrefix = "transition-";
const TransitionMediatorAny = TransitionMediatorPrefix + "any";

export const Transitions = {
  getState: transitionName => transitionState[transitionName],
  subAny: callback => mediator.sub(TransitionMediatorAny, callback),
  unsubAny: callback => mediator.unsub(TransitionMediatorAny, callback),

  pub: (transitionName, state, resetViewport) => {
    // update persistent state map
    if (resetViewport) {
      window.scrollTo(0, 0);
      Viewport.calcBounds();
      requestAnimationFrame(() =>
        Transitions.pub(transitionName, state, false)
      );
      return;
    }

    if (tryPubTransitionStateChange(transitionName, state)) {
      // dispatch group ones
      Transitions.pubMany({ [transitionName]: state }, false, true);

      // also dispatch global action, in case anyone is listening
      pubAnyTransitionStateChange();
    }
  },

  sub: (transitionName, callback) =>
    mediator.sub(TransitionMediatorPrefix + transitionName, callback),

  unsub: (transitionName, callback) =>
    mediator.unsub(TransitionMediatorPrefix + transitionName, callback),

  pubMany: (transitionNamesAndStates, resetViewport, pubGroupsOnly) => {
    // if resetting viewport, scroll to top/left calc the viewport bounds
    // and then retry the pubMany call in the next scheduled animation frame.
    if (resetViewport) {
      window.scrollTo(0, 0);
      Viewport.calcBounds();
      requestAnimationFrame(() =>
        Transitions.pubMany(transitionNamesAndStates, false)
      );
      return;
    }

    // key = transition group, value = object that collects bulk state value for each transition name for the given callback
    const groupMap = new WeakMapEx();

    Object.keys(transitionNamesAndStates).forEach(transitionName => {
      const transitionState = transitionNamesAndStates[transitionName];

      // if the single publish succeeded (i.e,. state changed), then try
      // to find the transition groups that are subbed to the transition name
      // and start creating the bulk state to be dispatched after the loop ends.
      if (
        pubGroupsOnly ||
        tryPubTransitionStateChange(transitionName, transitionState)
      ) {
        const groups = transitionNamesToGroupMap.getItems(transitionName);
        if (groups && groups.length) {
          groups.forEach(group => {
            let bulkState = groupMap.get(group, {});
            // update the bulk state update for each unique callback entry.
            // Do this for each transition name that's being bulk updated
            bulkState[transitionName] = transitionState;
          });
        }
      }
    });

    // for the second phase, trigger the callbacks of the groups we detected
    // state changes for and fire each of them with the bulk result for all transitions
    groupMap.keys.forEach(group => {
      const bulkState = groupMap.get(group);
      group.callback(bulkState);
    });

    pubAnyTransitionStateChange();
  },

  subMany: (transitionNames, bulkCallback) => {
    const group = new TransitionGroup(transitionNames, bulkCallback);
    transitionNames.forEach(transitionName => {
      transitionNamesToGroupMap.addItem(transitionName, group);
    });
    return group;
  },

  unsubMany: transitionGroup => {
    transitionGroup.transitionNames.forEach(transitionName => {
      transitionNamesToGroupMap.removeItem(transitionName, transitionGroup);
    });
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

export class TransitionGroup {
  transitionNames;
  callback;

  constructor(transitionNames, callback) {
    this.transitionNames = transitionNames;
    this.callback = callback;
  }
}

function tryPubTransitionStateChange(transitionName, state) {
  // get existing state for the transition
  var curState = transitionState[transitionName];

  // if current state is same as new, no need to do / publish anything
  if (curState === state) {
    return;
  }

  console.log(
    "Transitioning to name := " + transitionName + ", state := " + state
  );

  transitionState[transitionName] = state;

  // publish state change
  mediator.pub(TransitionMediatorPrefix + transitionName, state);

  console.log("Transitioned state := " + JSON.stringify(transitionState));

  return true;
}

function pubAnyTransitionStateChange() {
  mediator.pub(TransitionMediatorAny);
}
