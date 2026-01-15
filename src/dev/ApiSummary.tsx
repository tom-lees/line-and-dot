import { useEffect, useState } from "react";

const trainLines = ["elizabeth"];
const apiUrlStart = "https://api.tfl.gov.uk/Line/";
const apiUrlEnd = "/Arrivals";

export const ApiSummary = () => {
  const [data, setData] = useState<Record<string, unknown[]>>({});

  useEffect(() => {
    const fetchAllLines = async () => {
      const results: Record<string, unknown[]> = {};

      for (const trainLine of trainLines) {
        const apiUrl = apiUrlStart + trainLine + apiUrlEnd;

        try {
          const res = await fetch(apiUrl);
          const raw = await res.json();
          results[trainLine] = raw;
        } catch (err) {
          console.error("Error fetching data for line:", trainLine, err);
          results[trainLine] = [];
        }
      }
      setData(results);
    };
    fetchAllLines();
  }, []);

  return (
    <div>
      {Object.entries(data).map(([trainLine, records]) => (
        <div key={trainLine}>
          <strong>{trainLine}</strong>: {records.length} records
        </div>
      ))}
    </div>
  );
};
