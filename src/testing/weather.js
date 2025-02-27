import {
  checkWeatherData,
  filterCuacaJam17,
} from "../data/utils/weatherHandler";

export async function testingGetCuaca() {
  const iterations = 50;
  let reqTotalTime = 0;
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const cuaca = await filterCuacaJam17();
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    reqTotalTime += cuaca.timeTakenInSeconds;
    totalTime += timeTaken;
    console.log(`Response time for iteration ${i + 1}: ${timeTaken}s`);
  }
  const averageReqTime = reqTotalTime / iterations;
  const averageTime = totalTime / iterations;
  console.log(`Average req time: ${averageReqTime} sec`);
  console.log(`Average response time: ${averageTime} sec`);
}

export async function testingSaveWeatherData() {
  const iterations = 50;
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await checkWeatherData();
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    totalTime += timeTaken;
    console.log(`Response time for iteration ${i + 1}: ${timeTaken}s`);
  }

  const averageTime = totalTime / iterations;
  console.log(`Average response time: ${averageTime} sec`);
}
