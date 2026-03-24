import { configureStore } from '@reduxjs/toolkit'

// import reducers
import userReducer from './reducers/userReducer'
import notiReducer from './reducers/notiReducer'
import courseReducer from './reducers/courseReducer'
export default configureStore({
	reducer: {
		noti: notiReducer,
		user: userReducer,
		course: courseReducer,
	},
})
