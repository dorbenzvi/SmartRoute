"use strict";

const { fix } = require("mssql");
const R = require("ramda");

const randomFromRange = require("../utils/randomFromRange");

const createChildUsingOrderOneCrossover = (
  [parent1, parent2],
  minIndex,
  maxIndex
) => {
  const individualLength = parent1.length;
  const child = new Array(individualLength).fill();
  R.range(minIndex, maxIndex + 1).forEach((index) => {
    child[index] = parent1[index];
  });
  let childIndex = maxIndex + 1;
  [
    ...R.range(maxIndex + 1, individualLength),
    ...R.range(0, maxIndex + 1),
  ].forEach((index) => {
    if (!child.includes(parent2[index])) {
      child[childIndex % individualLength] = parent2[index];
      childIndex += 1;
    }
  });
  return child;
};

//ohad
function fixPinStops(arr) {
  var stringArrS = arr[0].join("");
  var firstStopS = stringArrS.indexOf(0);
  var lastStopS = stringArrS.indexOf(arr[0].length - 1);

  arr[0][firstStopS] = arr[0][0];
  arr[0][0] = 0;

  arr[0][lastStopS] = arr[0][arr[0].length - 1];
  arr[0][arr[0].length - 1] = arr[0].length - 1;

  var stringArrD = arr[1].join("");
  var firstStopD = stringArrD.indexOf(0);
  var lastStopD = stringArrD.indexOf(arr[1].length - 1);

  arr[1][firstStopD] = arr[1][0];
  arr[1][0] = 0;

  arr[1][lastStopD] = arr[1][arr[1].length - 1];
  arr[1][arr[1].length - 1] = arr[1].length - 1;

  console.log(arr);
  return arr;
}

const orderOne = () => ([mother, father], random) => {
  const individualLength = mother.length;
  const index1 = randomFromRange(random)(0, individualLength - 1);
  const index2 = randomFromRange(random)(0, individualLength - 1);
  const minIndex = Math.min(index1, index2);
  const maxIndex = Math.max(index1, index2);
  const son = createChildUsingOrderOneCrossover(
    [mother, father],
    minIndex,
    maxIndex
  );
  const daughter = createChildUsingOrderOneCrossover(
    [father, mother],
    minIndex,
    maxIndex
  );

  return fixPinStops([son, daughter]);
};

module.exports = orderOne;
module.exports.createChildUsingOrderOneCrossover = createChildUsingOrderOneCrossover;
