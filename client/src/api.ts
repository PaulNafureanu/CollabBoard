import axios from "axios";

const getHealth = async () => {
  const API_URL = (import.meta.env.VITE_API_URL as string) ?? "";
  const res = await axios.get<object>(`${API_URL}/health`);
  console.log(res.data);
  return res.data;
};

export default getHealth;
