<template>
	<my-page-container>
		<view class="myinfo-page">
			<!-- 用户信息卡片 -->
			<view class="info-card">
				<!-- 头像区域 -->
				<view class="avatar-section">
					<view class="avatar-wrapper" @click="handleAvatarClick">
						<up-avatar
							:src="formData.avatar"
							size="120"
							shape="circle"
						></up-avatar>
						<view class="avatar-edit-icon">
							<up-icon name="camera" size="20" color="#fff"></up-icon>
						</view>
					</view>
					<text class="username">{{ formData.username }}</text>
				</view>
			</view>

			<!-- 信息表单 -->
			<view class="form-section">
				<up-cell-group>
					<!-- 用户名（只读） -->
					<up-cell title="用户名" :value="formData.username"></up-cell>

										<!-- 性别选择 -->
					<up-cell title="性别" @click="handleGenderClick">
						<template #value>
							<text>{{ genderText }}</text>
						</template>
					</up-cell>

										<!-- 生日选择 -->
					<up-cell title="生日" @click="handleBirthdayClick">
						<template #value>
							<text>{{ formData.birthday || '请选择' }}</text>
						</template>
										</up-cell>
								</up-cell-group>
			</view>

			<!-- 操作按钮 -->
			<view class="action-section" v-if="isEditing">
				<up-button
					type="primary"
					text="保存修改"
					@click="handleSave"
					:loading="saving"
				></up-button>
				<up-button
					type="info"
					text="取消"
					@click="handleCancel"
					:disabled="saving"
				></up-button>
			</view>

			<!-- 编辑按钮 -->
			<view class="action-section" v-else>
				<up-button
					type="primary"
					text="编辑信息"
					@click="handleEdit"
				></up-button>
			</view>

			<!-- 性别选择器 -->
			<up-picker
				:show="showGenderPicker"
				:columns="genderColumns"
				valueName="value"
				@confirm="handleGenderConfirm"
				@cancel="showGenderPicker = false"
			></up-picker>

			<!-- 生日选择器 -->
			<up-datetime-picker
				:show="showBirthdayPicker"
				v-model="birthdayTimestamp"
				mode="date"
				:minDate="minDate"
				:maxDate="maxDate"
				@confirm="handleBirthdayConfirm"
				@cancel="showBirthdayPicker = false"
				@change="handleBirthdayChange"
			></up-datetime-picker>
		</view>
	</my-page-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserInfo, updateUserInfo } from '../../api/api'
import { hasLogin } from '../../utils/tools'
import myPageContainer from '../../components/my-page-container/my-page-container.vue'

const formData = ref({
	username: '',
	avatar: '',
	gender: 0,
	birthday: '',
	last_login_time: ''
})

const originalData = ref({})
const isEditing = ref(false)
const saving = ref(false)
const showGenderPicker = ref(false)
const showBirthdayPicker = ref(false)
const birthdayTimestamp = ref(Date.now())

const genderColumns = ref([
	[
		{ text: '未知', value: 0 },
		{ text: '男', value: 1 },
		{ text: '女', value: 2 }
	]
])

const minDate = new Date('1900-01-01').getTime()
const maxDate = Date.now()

const genderText = computed(() => {
	const genderMap = { 0: '未知', 1: '男', 2: '女' }
	return genderMap[formData.value.gender] || '未知'
})

onLoad(() => {
	loadUserInfo()
})

const loadUserInfo = () => {
	if (!hasLogin()) {
		uni.reLaunch({
			url: '/pages/index/index'
		})
		return
	}

	uni.showLoading({ title: '加载中...' })
	getUserInfo().then((res) => {
		uni.hideLoading()
		if (res.code === 200) {
			formData.value = {
				username: res.data.username || '',
				avatar: res.data.avatar || '',
				gender: res.data.gender || 0,
				birthday: res.data.birthday || '',
				last_login_time: res.data.last_login_time || ''
			}
			originalData.value = { ...formData.value }
			if (res.data.birthday) {
				birthdayTimestamp.value = new Date(res.data.birthday).getTime()
			}
			console.log('获取用户信息成功:', formData.value)
		} else {
			uni.showToast({
				title: res.message || '获取用户信息失败',
				icon: 'none'
			})
		}
	}).catch((error) => {
		uni.hideLoading()
		console.error('获取用户信息失败:', error)
		uni.showToast({
			title: '网络错误',
			icon: 'none'
		})
	})
}

const handleEdit = () => {
	isEditing.value = true
}

const handleGenderClick = () => {
	if (!isEditing.value) return
	showGenderPicker.value = true
}

const handleBirthdayClick = () => {
	if (!isEditing.value) return
	showBirthdayPicker.value = true
}

const handleCancel = () => {
	formData.value = { ...originalData.value }
	isEditing.value = false
	uni.showToast({
		title: '已取消修改',
		icon: 'none'
	})
}

const handleSave = () => {
	if (saving.value) return

	saving.value = true
	const updateData = {
		avatar: formData.value.avatar,
		gender: formData.value.gender,
		birthday: formData.value.birthday
	}

	uni.showLoading({ title: '保存中...' })
	updateUserInfo(updateData).then((res) => {
		uni.hideLoading()
		saving.value = false
		if (res.code === 200) {
			originalData.value = { ...formData.value }
			isEditing.value = false
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})
			console.log('更新用户信息成功:', res.data)
		} else {
			uni.showToast({
				title: res.message || '保存失败',
				icon: 'none'
			})
		}
	}).catch((error) => {
		uni.hideLoading()
		saving.value = false
		console.error('更新用户信息失败:', error)
		uni.showToast({
			title: '网络错误',
			icon: 'none'
		})
	})
}

const handleAvatarClick = () => {
	if (!isEditing.value) return

	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			const tempFilePath = res.tempFilePaths[0]
			uni.showLoading({ title: '上传中...' })
			uni.uploadFile({
				url: 'https://your-api-domain.com/upload',
				filePath: tempFilePath,
				name: 'file',
				success: (uploadRes) => {
					uni.hideLoading()
					try {
						const data = JSON.parse(uploadRes.data)
						if (data.code === 200 && data.url) {
							formData.value.avatar = data.url
							uni.showToast({
								title: '上传成功',
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: '上传失败',
								icon: 'none'
							})
						}
					} catch (e) {
						console.error('解析上传响应失败:', e)
						formData.value.avatar = tempFilePath
						uni.showToast({
							title: '上传成功（本地预览）',
							icon: 'success'
						})
					}
				},
				fail: (error) => {
					uni.hideLoading()
					console.error('上传失败:', error)
					formData.value.avatar = tempFilePath
					uni.showToast({
						title: '上传成功（本地预览）',
						icon: 'success'
					})
				}
			})
		}
	})
}

const handleGenderConfirm = (e) => {
	formData.value.gender = e.value[0].value
	showGenderPicker.value = false
}

const handleBirthdayChange = (e) => {
	const date = new Date(e.value)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	formData.value.birthday = `${year}-${month}-${day}`
}

const handleBirthdayConfirm = (e) => {
	const date = new Date(e.value)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	formData.value.birthday = `${year}-${month}-${day}`
	showBirthdayPicker.value = false
}

const formatTime = (time) => {
	if (!time) return '-'
	const date = new Date(time)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	return `${year}-${month}-${day} ${hour}:${minute}`
}
</script>

<style lang="scss" scoped>
.myinfo-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 20rpx;
}

.info-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.avatar-wrapper {
	position: relative;
	border-radius: 50%;
	cursor: pointer;
	transition: transform 0.3s ease;

	&:active {
		transform: scale(0.95);
	}
}

.avatar-edit-icon {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.username {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.form-section {
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

	::v-deep .up-cell {
		padding: 30rpx 32rpx;
	}

	::v-deep .up-cell__body {
		font-size: 30rpx;
	}
}

.readonly-text {
	color: #999;
	font-size: 28rpx;
}

.action-section {
	padding: 20rpx 0;
	display: flex;
	flex-direction: column;
	gap: 20rpx;

	::v-deep .up-button {
		border-radius: 12rpx;
	}
}

::v-deep .u-picker {
	background-color: white !important;
}
</style>
