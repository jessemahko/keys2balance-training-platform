import { configureStore } from '@reduxjs/toolkit'

// import reducers
import userReducer from './reducers/userReducer'
import notiReducer from './reducers/notiReducer'
import announcementReducer from './reducers/announceReducer'
export default configureStore({
	reducer: {
		notifications: announcementReducer,
		noti: notiReducer,
		user: userReducer,
	},
})
