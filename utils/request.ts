import axios, { AxiosInstance } from 'axios'

type Header = {
  Authorization?: string,
}

const Request = (token?:string|null, baseUrl?: string): AxiosInstance => {
  const headers: Header = { }

  if(token){
    headers.Authorization = `Bearer ${token}`
  }

  return axios.create({
    baseURL: baseUrl || process.env.NEXT_PUBLIC_API_URL,
    headers
  });
}

export default Request
