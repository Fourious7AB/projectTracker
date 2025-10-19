import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axios'

// Async thunks
export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async ({ projectId, days = 30 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/overview', {
        params: { projectId, days }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data')
    }
  }
)

export const fetchKeywordAnalysis = createAsyncThunk(
  'dashboard/fetchKeywordAnalysis',
  async ({ keyword, days = 30 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/keyword/${keyword}`, {
        params: { days }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch keyword analysis')
    }
  }
)

export const fetchEngineComparison = createAsyncThunk(
  'dashboard/fetchEngineComparison',
  async ({ projectId, days = 30 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/engine-comparison', {
        params: { projectId, days }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch engine comparison')
    }
  }
)

export const runVisibilityChecks = createAsyncThunk(
  'dashboard/runVisibilityChecks',
  async ({ projectId, engines, keywords }, { rejectWithValue }) => {
    try {
      const response = await api.post('/checks/run', {
        projectId,
        engines,
        keywords
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to run visibility checks')
    }
  }
)

const initialState = {
  overview: {
    visibilityScore: [],
    trends: [],
    keywordBreakdown: [],
    recommendations: []
  },
  keywordAnalysis: null,
  engineComparison: null,
  loading: false,
  error: null,
  runningChecks: false
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearKeywordAnalysis: (state) => {
      state.keywordAnalysis = null
    },
    clearEngineComparison: (state) => {
      state.engineComparison = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard overview
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false
        state.overview = action.payload
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch keyword analysis
      .addCase(fetchKeywordAnalysis.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchKeywordAnalysis.fulfilled, (state, action) => {
        state.loading = false
        state.keywordAnalysis = action.payload
      })
      .addCase(fetchKeywordAnalysis.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch engine comparison
      .addCase(fetchEngineComparison.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEngineComparison.fulfilled, (state, action) => {
        state.loading = false
        state.engineComparison = action.payload
      })
      .addCase(fetchEngineComparison.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Run visibility checks
      .addCase(runVisibilityChecks.pending, (state) => {
        state.runningChecks = true
        state.error = null
      })
      .addCase(runVisibilityChecks.fulfilled, (state, action) => {
        state.runningChecks = false
      })
      .addCase(runVisibilityChecks.rejected, (state, action) => {
        state.runningChecks = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearKeywordAnalysis, clearEngineComparison } = dashboardSlice.actions
export default dashboardSlice.reducer
