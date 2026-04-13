const USER_INFO_KEY = 'userInfo'

export const setUserInfo = (userData) => {
	try {
		uni.setStorageSync(USER_INFO_KEY, userData)
	} catch (e) {
		console.error('存储用户信息失败', e)
	}
}

export const getUserInfo = () => {
	try {
		return uni.getStorageSync(USER_INFO_KEY)
	} catch (e) {
		console.error('获取用户信息失败', e)
		return null
	}
}

export const hasLogin = () => {
	try {
		const userInfo = uni.getStorageSync(USER_INFO_KEY)
		return !!(userInfo && userInfo.token)
	} catch (e) {
		console.error('检查登录状态失败', e)
		return false
	}
}

export const clearUserInfo = () => {
	try {
		uni.removeStorageSync(USER_INFO_KEY)
	} catch (e) {
		console.error('清除用户信息失败', e)
	}
}


export const startNavigation = (latitude,longitude) => {
	uni.openLocation({
		latitude: latitude,
		longitude: longitude,
		success: () => {
			console.log('success')
		}
	})
}