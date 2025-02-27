import { bacaHariLibur } from "../data/source";

export async function testingFetchHolidays() {
  const iterations = 30;
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await bacaHariLibur("2025-02-25", 2025);
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    totalTime += timeTaken;
    console.log(`Response time for iteration ${i + 1}: ${timeTaken}s`);
  }

  const averageTime = totalTime / iterations;
  console.log(`Average response time: ${averageTime} sec`);
}
