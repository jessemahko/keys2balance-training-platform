import { configureStore } from '@reduxjs/toolkit'

// import reducers
import userReducer from './reducers/userReducer'
import usersReducer from './reducers/usersReducer'
import notiReducer from './reducers/notiReducer'
import courseReducer from './reducers/courseReducer'
import discussionReducer from './reducers/discussionReducer'
import announcementReducer from './reducers/announceReducer'

export default configureStore({
	reducer: {
		notifications: announcementReducer,
		noti: notiReducer,
		user: userReducer,
		users: usersReducer,
		course: courseReducer,
		discussion: discussionReducer,
	},
})
