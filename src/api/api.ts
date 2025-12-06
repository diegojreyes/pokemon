import axios from "axios";


const api = axios.create({
    baseURL : import.meta.env.SERVER ? import.meta.env.SERVER : "http://127.0.0.1:8000/"
})

export default api