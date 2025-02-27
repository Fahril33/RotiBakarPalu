import { testingFetchHolidays } from "./evetRaya";
import { testingGetCuaca, testingSaveWeatherData } from "./weather";

export async function doTest() {
    // await testingGetCuaca()
    // await testingSaveWeatherData()
    await testingFetchHolidays()
}