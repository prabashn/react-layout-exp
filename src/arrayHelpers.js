export function tryRemoveItem(array, value) {
  const valueIndex = array.indexOf(value);
  if (valueIndex >= 0) {
    array.splice(valueIndex, 1);
    return true;
  }
}

export function tryAddItem(array, value) {
  const valueIndex = array.indexOf(value);
  if (valueIndex < 0) {
    array.push(value);
    return true;
  }
}
