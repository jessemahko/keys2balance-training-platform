import { configureStore } from '@reduxjs/toolkit'

// import reducers
import userReducer from './reducers/userReducer'
import notiReducer from './reducers/notiReducer'
export default configureStore({
	reducer: {
		noti: notiReducer,
		user: userReducer,
	},
})
