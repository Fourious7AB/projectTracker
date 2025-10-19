import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import projectReducer from './slices/projectSlice'
import dashboardReducer from './slices/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
