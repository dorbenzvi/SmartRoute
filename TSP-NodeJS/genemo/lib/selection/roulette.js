"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const R = require('ramda');

const {
  checkProps,
  types
} = require('../utils/typeChecking');

const {
  normalizeCumulativeFitness,
  selectRouletteElement
} = require('./utils/rouletteUtils');

const {
  min,
  max
} = require('../utils/numbersListHelpers');

const normalizePopulationFitness = (evaluatedPopulation, minimizeFitness) => {
  const minFitness = min(evaluatedPopulation.map(({
    fitness
  }) => fitness));
  const maxFitness = max(evaluatedPopulation.map(({
    fitness
  }) => fitness));
  return evaluatedPopulation.map(evaluatedIndividual => _objectSpread(_objectSpread({}, evaluatedIndividual), {}, {
    normalizedFitness: minimizeFitness ? maxFitness - evaluatedIndividual.fitness : evaluatedIndividual.fitness - minFitness
  }));
};

const calculateCumulativeFitness = populationWithNormalizedFitness => R.scan((prev, currIndividual) => ({
  evaluatedIndividual: currIndividual,
  cumulativeFitness: prev.cumulativeFitness + currIndividual.normalizedFitness
}), {
  cumulativeFitness: 0
}, populationWithNormalizedFitness).slice(1);

const propTypes = {
  minimizeFitness: {
    type: types.BOOLEAN,
    isRequired: true
  }
};

const rouletteSelection = options => {
  checkProps({
    functionName: 'Genemo.selection.roulette',
    props: options,
    propTypes
  });
  const {
    minimizeFitness
  } = options;
  return (evaluatedPopulation, random) => {
    const populationWithNormalizedFitness = normalizePopulationFitness(evaluatedPopulation, minimizeFitness);
    const cumulativeFitness = calculateCumulativeFitness(populationWithNormalizedFitness);
    const normalizedCumulativeFitness = normalizeCumulativeFitness(cumulativeFitness);
    return new Array(evaluatedPopulation.length).fill().map(() => selectRouletteElement(normalizedCumulativeFitness, random()));
  };
};

module.exports = rouletteSelection;