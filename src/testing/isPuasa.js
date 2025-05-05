import { convertGtoH } from "../data/source";

export async function testingDataPuasa() {
  const iterations = 50;
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await convertGtoH()
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    totalTime += timeTaken;
    console.log(`Response time for iteration ${i + 1}: ${timeTaken}s`);
  }

  const averageTime = totalTime / iterations;
  console.log(`Average response time: ${averageTime} sec`);
}
