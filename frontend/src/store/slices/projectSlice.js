import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axios'

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects')
    }
  }
)

export const fetchProject = createAsyncThunk(
  'projects/fetchProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project')
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project')
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project')
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}`)
      return projectId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project')
    }
  }
)

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch single project
      .addCase(fetchProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false
        state.currentProject = action.payload
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects.unshift(action.payload.project)
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false
        const index = state.projects.findIndex(p => p._id === action.payload.project._id)
        if (index !== -1) {
          state.projects[index] = action.payload.project
        }
        if (state.currentProject && state.currentProject._id === action.payload.project._id) {
          state.currentProject = action.payload.project
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects = state.projects.filter(p => p._id !== action.payload)
        if (state.currentProject && state.currentProject._id === action.payload) {
          state.currentProject = null
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setCurrentProject } = projectSlice.actions
export default projectSlice.reducer
