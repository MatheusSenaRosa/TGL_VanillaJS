import { IGamesData } from "../interfaces";

export const getGamesData = async (): Promise<IGamesData> => {
  const response = await fetch("http://localhost:3000/data");
  const data = await response.json();

  return data;
};
