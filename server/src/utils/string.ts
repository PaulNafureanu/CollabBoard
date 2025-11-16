export const strToArray = (str: string) =>
  typeof str === "string" && str.includes(",") ? str.split(",").map((s) => s.trim()) : str;
