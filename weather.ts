const CITY = "Jakarta,ID";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const DAILY_TIMESLOT = "12:00:00";
const DAYS_TO_SHOW = 5;

interface ForecastEntry {
  dt_txt: string;
  main: { temp: number };
}

interface ForecastResponse {
  list: ForecastEntry[];
}

interface DailyTemp {
  date: Date;
  temp: number;
}

function loadApiKey(): string {
  process.loadEnvFile();
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY not found. Add it to a .env file as API_KEY=<your key>.");
    process.exit(1);
  }
  return apiKey;
}

async function fetchForecast(city: string, apiKey: string): Promise<ForecastResponse> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("q", city);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json() as Promise<ForecastResponse>;
}

function extractDailyTemps(forecast: ForecastResponse, days: number): DailyTemp[] {
  const dailyTemps: DailyTemp[] = [];

  for (const entry of forecast.list) {
    if (!entry.dt_txt.includes(DAILY_TIMESLOT)) continue;
    dailyTemps.push({ date: new Date(entry.dt_txt.replace(" ", "T") + "Z"), temp: entry.main.temp });
    if (dailyTemps.length === days) break;
  }

  return dailyTemps;
}

function formatReport(dailyTemps: DailyTemp[]): string {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });
  const day = new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const year = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "UTC" });

  const lines = ["Weather Forecast:"];
  for (const { date, temp } of dailyTemps) {
    lines.push(
      `${weekday.format(date)}, ${day.format(date)} ${month.format(date)} ${year.format(date)}: ${temp.toFixed(2)}°C`
    );
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const apiKey = loadApiKey();
  const forecast = await fetchForecast(CITY, apiKey);
  const dailyTemps = extractDailyTemps(forecast, DAYS_TO_SHOW);
  console.log(formatReport(dailyTemps));
}

main();
