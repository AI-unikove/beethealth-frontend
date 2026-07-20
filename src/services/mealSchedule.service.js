import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const mealScheduleService = {
  getMealSchedule() {
    return axios.get(`${API_URL}/meal-schedule`)
  },
}

export default mealScheduleService
