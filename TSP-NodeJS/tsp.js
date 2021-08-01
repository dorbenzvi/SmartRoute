/** @format */
require("dotenv").config();
const Genemo = require("./genemo");
var distance = require("google-distance");
const fetch = require("node-fetch");
var moment = require("moment"); // require
moment().format();

function creteApiString(origins, destinations, departureTime) {
  let originsString = "";
  let destinationsString = "";
  origins.forEach((element, index) => {
    if (index != origins.length - 1) {
      originsString += element + "|";
    } else {
      originsString += element;
    }
  });

  destinations.forEach((element, index) => {
    if (index != destinations.length - 1) {
      destinationsString += element + "|";
    } else {
      destinationsString += element;
    }
  });

  let ApiURL =
    "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" +
    originsString +
    "&destinations=" +
    destinationsString +
    "&key=" +
    process.env.GOOGLE_API +
    "";

  return ApiURL;
}

var addressPrev = [];
var prevMatrix = [];

async function Genetic(data, response) {
  try {
    console.log(data);
    let address = data.points.map((item) => {
      return item.Address;
    });
    console.log(address);

    var size = address.length;
    var limit = 10; // dimensions limit of google api
    var distanceMatrix = new Array(size * size).fill(null); // initialize full matrix
    //var distanceMatrix2 = new Array(size * size).fill(null); //for test name

    if (JSON.stringify(address) != JSON.stringify(addressPrev)) {
      // index of big matrix
      var global_i = 0;
      var global_j = 0;
      var pin_i = 0;

      while (global_i < size && global_j < size) {
        // loop until complete create big matrix with all adderss
        var origins = [];
        var destinations = [];
        for (
          let local_i = 0;
          local_i < limit && global_i + local_i < size;
          local_i++
        ) {
          origins.push(address[global_i + local_i]);
        }
        for (
          let local_j = 0;
          local_j < limit && global_j + local_j < size;
          local_j++
        ) {
          destinations.push(address[global_j + local_j]);
        }

        //create distance matrix api request
        let ApiURL = await creteApiString(origins, destinations, "now");

        try {
          let response = await fetch(ApiURL); // get distance matrix data
          let data = await response.json();

          for (let i = 0; i < origins.length; i++) {
            for (let j = 0; j < destinations.length; j++) {
              //console.log(data.rows[i].elements[j]);
              distanceMatrix[(global_i + i) * size + (global_j + j)] =
                data.rows[i].elements[j];
              //distanceMatrix2[(global_i + i) * size + (global_j + j)] =
              // "from " + origins[i] + "to " + destinations[j];
            }
          }

          global_i += origins.length;
          global_j += destinations.length;

          // check wich pice of matrix is next
          if (global_i < size && global_j < size) {
            global_i = pin_i;
          } else if (global_i < size && global_j >= size) {
            pin_i = global_i;

            global_j = 0;
          } else if (global_i >= size && global_j < size) {
            global_i = pin_i;
          }
        } catch (error) {
          console.error(error);
        }
      }
      prevMatrix = distanceMatrix;
      addressPrev = address;
    } else {
      console.log("again --------------------------------------------");
      distanceMatrix = prevMatrix;
    }
    //console.log(distanceMatrix2);
    // console.log(distanceMatrix);
    var bestForConstraint = Infinity;
    var bestForWithoutCinstraint = Infinity;
    // genetic algorithm
    // for (let index = 0; index < data.points.length; index++) {

    // }

    let hasConstraints = false;
    for (let index = 0; index < data.points.length; index++) {
      if (data.points[index].Constraint) {
        hasConstraints = true;
        break;
      }
    }

    if (hasConstraints) {
      Promise.all([
        Genemo.run({
          generateInitialPopulation: Genemo.generateInitialPopulation({
            generateIndividual() {
              let temp = [];
              temp.push(0);
              for (let i = 1; i < size - 1; i++) {
                let max = size - 2;
                let min = 1;
                do {
                  n = Math.floor(Math.random() * (max - min + 1)) + min;
                  p = temp.includes(n);
                  if (!p) {
                    temp.push(n);
                  }
                } while (p);
              }
              temp.push(size - 1);
              //console.log(temp);
              return temp;
            }, // Here, provide a function which generates an individual
            size: 100,
          }),
          selection: Genemo.selection.tournament({
            size: 50,
            minimizeFitness: true,
          }),
          reproduce: Genemo.reproduce({
            crossover: Genemo.crossover.PMX(),
            mutate: Genemo.mutation.swapTwoGenes(),
            mutationProbability: 0.1,
          }),
          evaluatePopulation: Genemo.evaluatePopulation({
            fitnessFunction(Individual) {
              let duration = 0;
              let time = moment(data.startTime)
                .utc()
                .format("MM/DD/YYYY HH:mm");
              for (let i = 0; i < size - 1; i++) {
                let from = Individual[i];
                let to = Individual[i + 1];
                // console.log(
                //   "from " +
                //     from +
                //     request.body[from] +
                //     " to " +
                //     to +
                //     request.body[to] +
                //     " duartion is " +
                //     data[from * size + to].durationValue +
                //     " index " +
                //     (from * size + to)
                // );
                //time at stop
                time = moment(time)
                  .add(
                    distanceMatrix[from * size + to].duration.value,
                    "second"
                  )
                  .format("MM/DD/YYYY HH:mm");
                duration += distanceMatrix[from * size + to].duration.value;
                if (data.points[from].MinutesInStop) {
                  time = moment(time)
                    .add(data.points[from].MinutesInStop, "minute")
                    .format("MM/DD/YYYY HH:mm");
                  duration += data.points[from].MinutesInStop * 60;
                }

                if (data.points[to].Constraint) {
                  let Time = moment(time).format("HH:mm");
                  let constarint = moment(data.points[to].Constraint)
                    .utc()
                    .format("HH:mm");
                  if (constarint < Time) {
                    duration += 100000;
                  }
                }
              }
              if (duration < bestForConstraint) {
                bestForConstraint = duration;
                console.log("best with" + bestForConstraint);
              }
              return duration;
            },
          }), // You need to provide your own fitness function
          stopCondition: Genemo.stopCondition({ maxIterations: 100 }),
        }),
        Genemo.run({
          generateInitialPopulation: Genemo.generateInitialPopulation({
            generateIndividual() {
              let temp = [];
              temp.push(0);
              for (let i = 1; i < size - 1; i++) {
                let max = size - 2;
                let min = 1;
                do {
                  n = Math.floor(Math.random() * (max - min + 1)) + min;
                  p = temp.includes(n);
                  if (!p) {
                    temp.push(n);
                  }
                } while (p);
              }
              temp.push(size - 1);
              //console.log(temp);
              return temp;
            }, // Here, provide a function which generates an individual
            size: 100,
          }),
          selection: Genemo.selection.tournament({
            size: 50,
            minimizeFitness: true,
          }),
          reproduce: Genemo.reproduce({
            crossover: Genemo.crossover.PMX(),
            mutate: Genemo.mutation.swapTwoGenes(),
            mutationProbability: 0.1,
          }),
          evaluatePopulation: Genemo.evaluatePopulation({
            fitnessFunction(Individual) {
              let duration = 0;

              for (let i = 0; i < size - 1; i++) {
                let from = Individual[i];
                let to = Individual[i + 1];

                // console.log(
                //   "from " +
                //     from +
                //     request.body[from] +
                //     " to " +
                //     to +
                //     request.body[to] +
                //     " duartion is " +
                //     data[from * size + to].durationValue +
                //     " index " +
                //     (from * size + to)
                // );
                if (data.points[from].MinutesInStop) {
                  duration += data.points[from].MinutesInStop * 60;
                }

                duration += distanceMatrix[from * size + to].duration.value;
              }
              if (duration < bestForWithoutCinstraint) {
                bestForWithoutCinstraint = duration;
                console.log("best " + bestForWithoutCinstraint);
              }
              return duration;
            },
          }), // You need to provide your own fitness function
          stopCondition: Genemo.stopCondition({ maxIterations: 100 }),
        }),
      ]).then((val) => {
        //console.log(evaluatedPopulation);
        let dataToReturn = [];
        //console.log(evaluatedPopulation);
        val.map(
          (
            { evaluatedPopulation, logs, getLowestFitnessIndividual },
            index
          ) => {
            if (index == 0) {
              let Individual = getLowestFitnessIndividual().individual;

              let constraintsCount = 0;
              let goodConstraints = 0;
              let duration = 0;
              let time = moment(data.startTime)
                .utc()
                .format("MM/DD/YYYY HH:mm");
              for (let i = 0; i < size - 1; i++) {
                let from = Individual[i];
                let to = Individual[i + 1];

                time = moment(time)
                  .add(
                    distanceMatrix[from * size + to].duration.value,
                    "second"
                  )
                  .format("MM/DD/YYYY HH:mm");
                duration += distanceMatrix[from * size + to].duration.value;
                if (data.points[from].MinutesInStop) {
                  time = moment(time)
                    .add(data.points[from].MinutesInStop, "minute")
                    .format("MM/DD/YYYY HH:mm");
                  duration += data.points[from].MinutesInStop * 60;
                }

                if (data.points[to].Constraint) {
                  constraintsCount++;
                  let Time = moment(time).format("HH:mm");
                  let constarint = moment(data.points[to].Constraint)
                    .utc()
                    .format("HH:mm");
                  if (constarint < Time) {
                    isFitWithConstraints = false;
                  } else {
                    goodConstraints++;
                  }
                }
              }
              let dataWithConstartint = getLowestFitnessIndividual()
              dataWithConstartint.fitness -= ((constraintsCount - goodConstraints) * 100000)
              dataToReturn.push({
                order: dataWithConstartint,
                type: "withConstartint",
                succses: goodConstraints === constraintsCount,
                msg: `${goodConstraints}/${constraintsCount}`,
              });
            } else {
              dataToReturn.push({
                order: getLowestFitnessIndividual(),
                type: "withoutConstartint",
              });
            }
            let route = getLowestFitnessIndividual().individual;
            for (let index = 0; index < route.length; index++) {
              console.log(address[route[index]]);
            }
            console.log("---------------------");
            //console.log(getLowestFitnessIndividual());
          }
        );
        // return order of best result
        response.status(200).end(JSON.stringify(dataToReturn));

        //console.log(evaluatedPopulation);)
      });
    } else {
      Genemo.run({
        generateInitialPopulation: Genemo.generateInitialPopulation({
          generateIndividual() {
            let temp = [];
            temp.push(0);
            for (let i = 1; i < size - 1; i++) {
              let max = size - 2;
              let min = 1;
              do {
                n = Math.floor(Math.random() * (max - min + 1)) + min;
                p = temp.includes(n);
                if (!p) {
                  temp.push(n);
                }
              } while (p);
            }
            temp.push(size - 1);
            //console.log(temp);
            return temp;
          }, // Here, provide a function which generates an individual
          size: 100,
        }),
        selection: Genemo.selection.tournament({
          size: 50,
          minimizeFitness: true,
        }),
        reproduce: Genemo.reproduce({
          crossover: Genemo.crossover.PMX(),
          mutate: Genemo.mutation.swapTwoGenes(),
          mutationProbability: 0.1,
        }),
        evaluatePopulation: Genemo.evaluatePopulation({
          fitnessFunction(Individual) {
            let duration = 0;

            for (let i = 0; i < size - 1; i++) {
              let from = Individual[i];
              let to = Individual[i + 1];

              // console.log(
              //   "from " +
              //     from +
              //     request.body[from] +
              //     " to " +
              //     to +
              //     request.body[to] +
              //     " duartion is " +
              //     data[from * size + to].durationValue +
              //     " index " +
              //     (from * size + to)
              // );
              if (data.points[from].MinutesInStop) {
                duration += data.points[from].MinutesInStop * 60;
              }

              duration += distanceMatrix[from * size + to].duration.value;
            }
            if (duration < bestForWithoutCinstraint) {
              bestForWithoutCinstraint = duration;
              console.log("best " + bestForWithoutCinstraint);
            }
            return duration;
          },
        }), // You need to provide your own fitness function
        stopCondition: Genemo.stopCondition({ maxIterations: 100 }),
      }).then(({ evaluatedPopulation, logs, getLowestFitnessIndividual }) => {
        let data = [];

        data.push({
          order: getLowestFitnessIndividual(),
          type: "withoutConstartint",
        });

        console.log(getLowestFitnessIndividual());

        // return order of best result
        response.status(200).end(JSON.stringify(data));
      });
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  Genetic: Genetic,
};
