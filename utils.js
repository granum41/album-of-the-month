//Write a test for these
function removeAttributes(jsonObject, ...attributeNames) {
    for(let entry in jsonObject) {
      if(attributeNames.some(e => e == entry)) { // entry needs loose equality
        delete jsonObject[entry];
      } else if (typeof jsonObject[entry] === 'object') {
        removeAttributes(jsonObject[entry], attributeNames);
      }
    }
  }
  
function sortMap(map) {
    return new Map([...map].sort((a, b) => b[1].count - a[1].count));
}

module.exports = { removeAttributes, sortMap }; 