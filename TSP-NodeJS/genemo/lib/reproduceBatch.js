"use strict";

const R = require('ramda');

const {
  checkProps,
  types
} = require('./utils/typeChecking');

const Timer = require('./utils/timer');

const getRandomIndividual = require('./utils/getRandomIndividual');

const selectParentsPairs = ({
  evaluatedPopulation,
  targetPopulationSize,
  random
}) => R.range(0, Math.ceil(targetPopulationSize / 2)).map(() => {
  const mother = getRandomIndividual(evaluatedPopulation, random).individual;
  const father = getRandomIndividual(evaluatedPopulation, random).individual;
  return [mother, father];
});

const getIndividualsByMutationInfo = ({
  individuals,
  shouldBeMutated
}) => individuals.filter(item => item.shouldBeMutated === shouldBeMutated).map(({
  individual
}) => individual);

const DEFAULT_MUTATION_PROBABILITY = 0.01;
const reproduceBatchPropTypes = {
  mutateAll: {
    type: types.FUNCTION,
    isRequired: true
  },
  crossoverAll: {
    type: types.FUNCTION,
    isRequired: true
  },
  mutationProbability: {
    type: types.NUMBER,
    isRequired: false
  }
};

const reproduceBatch = options => {
  checkProps({
    functionName: 'Genemo.reproduceBatch',
    props: options,
    propTypes: reproduceBatchPropTypes
  });
  const {
    mutateAll,
    crossoverAll,
    mutationProbability = DEFAULT_MUTATION_PROBABILITY
  } = options;
  const timer = Timer();
  return async (evaluatedPopulation, random, collectLog) => {
    const targetPopulationSize = evaluatedPopulation.length;
    timer.start();
    const parentsPairs = selectParentsPairs({
      evaluatedPopulation,
      targetPopulationSize,
      random
    });
    const childrenPairs = await crossoverAll(parentsPairs, random);
    const newPopulation = R.unnest(childrenPairs).slice(0, targetPopulationSize);
    collectLog('crossover', timer.stop());
    timer.start();
    const populationPreparedForMutation = newPopulation.map(individual => ({
      individual,
      shouldBeMutated: random() <= mutationProbability
    }));
    const individualsToBeMutated = getIndividualsByMutationInfo({
      individuals: populationPreparedForMutation,
      shouldBeMutated: true
    });
    const unchangedIndividuals = getIndividualsByMutationInfo({
      individuals: populationPreparedForMutation,
      shouldBeMutated: false
    });
    const mutatedIndividuals = await mutateAll(individualsToBeMutated, random);
    const mutatedPopulation = [...unchangedIndividuals, ...mutatedIndividuals];
    collectLog('mutation', timer.stop());
    return mutatedPopulation;
  };
};

module.exports = reproduceBatch;
module.exports.selectParentsPairs = selectParentsPairs;