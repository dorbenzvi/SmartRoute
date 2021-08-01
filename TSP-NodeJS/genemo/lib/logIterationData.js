"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  checkProps,
  types
} = require('./utils/typeChecking');

const {
  mean
} = require('./utils/numbersListHelpers');

const iterationFormatter = (key, value) => `#${value}`;

const fitnessFormatter = (key, value) => `${key} = ${value}`;

const timeFormatter = (key, value) => `${key} = ${value.toFixed(2)}ms`;

const logIterationDataPropTypes = {
  include: {
    type: types.OBJECT,
    isRequired: true
  },
  customLogger: {
    type: types.FUNCTION,
    isRequired: false
  }
};

const logIterationData = options => {
  checkProps({
    functionName: 'Genemo.logIterationData',
    props: options,
    propTypes: logIterationDataPropTypes
  });
  const {
    include,
    customLogger = console.log // eslint-disable-line no-console

  } = options;
  return ({
    evaluatedPopulation,
    iteration,
    logs,
    getLowestFitnessIndividual,
    getHighestFitnessIndividual
  }) => {
    const iterationNumber = _objectSpread({
      show: false,
      formatter: iterationFormatter
    }, include.iteration || {});

    const minFitness = _objectSpread({
      show: false,
      formatter: fitnessFormatter
    }, include.minFitness || {});

    const maxFitness = _objectSpread({
      show: false,
      formatter: fitnessFormatter
    }, include.maxFitness || {});

    const avgFitness = _objectSpread({
      show: false,
      formatter: fitnessFormatter
    }, include.avgFitness || {});

    const logsKeys = include.logsKeys || [];
    const texts = [iterationNumber.show && iterationNumber.formatter('iteration', iteration), minFitness.show && minFitness.formatter('minFitness', getLowestFitnessIndividual().fitness), maxFitness.show && maxFitness.formatter('maxFitness', getHighestFitnessIndividual().fitness), avgFitness.show && avgFitness.formatter('avgFitness', mean(evaluatedPopulation.map(({
      fitness
    }) => fitness))), ...logsKeys.map(({
      key,
      formatter = timeFormatter
    }) => logs[key] && formatter(key, logs[key].lastValue))].filter(text => Boolean(text));
    customLogger(texts.join(', '));
  };
};

module.exports = logIterationData;