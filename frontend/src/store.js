import { configureStore } from '@reduxjs/toolkit'

// import reducers
import userReducer from './reducers/userReducer'

export default configureStore({
	reducer: {
		user: userReducer,
	},
})
