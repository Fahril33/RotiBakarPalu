
import { predictSales } from "../scripts/utils/python/predict";

export async function testingPrediction() {
  const iterations = 50;
  let totalTime = 0;
  const dataTest = {
    weekend: "true",
    libur: "false",
    cuaca: "mendung",
    event_raya: "none",
  };


  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await predictSales(dataTest);
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    totalTime += timeTaken;
    console.log(`Response time for iteration ${i + 1}: ${timeTaken}s`);
  }

  const averageTime = totalTime / iterations;
  console.log(`Average response time: ${averageTime} sec`);
}
