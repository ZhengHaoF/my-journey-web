<template>
	<page-container>
		<view class="login-container">
			<view class="header">
				<text class="title">My Journey</text>
				<text class="subtitle">{{ isLoginMode ? '欢迎回来' : '创建账号' }}</text>
			</view>

			<view class="form">
				<up-input
					v-model="formData.username"
					placeholder="请输入用户名"
					:prefixIcon="userIcon"
					prefixIconStyle="font-size: 22px;"
					clearable
					class="input-field"
				/>
				
				<up-input
					v-model="formData.password"
					type="password"
					placeholder="请输入密码"
					:prefixIcon="lockIcon"
					prefixIconStyle="font-size: 22px;"
					clearable
					class="input-field"
				/>

				<up-button
					type="primary"
					:loading="loading"
					@click="handleSubmit"
					class="submit-btn"
				>
					{{ isLoginMode ? '登录' : '注册' }}
				</up-button>

				<view class="switch-mode">
					<text class="switch-text" @click="switchMode">
						{{ isLoginMode ? '还没有账号？立即注册' : '已有账号？立即登录' }}
					</text>
				</view>
			</view>
		</view>
	</page-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { loginAPP, registerAPP } from '../../api/api'
import { setUserInfo, hasLogin } from '../../utils/tools'
import pageContainer from '../../components/page-container/page-container.vue'

const isLoginMode = ref(true)
const loading = ref(false)
const userIcon = 'account'
const lockIcon = 'lock'

const formData = reactive({
	username: '',
	password: ''
})

onMounted(() => {
	if (hasLogin()) {
		uni.showToast({
			title: '您已登录',
			icon: 'success'
		})
		uni.switchTab({
			url: '/pages/Home/Home'
		})
	}
})

const handleSubmit = () => {
	if (!formData.username || !formData.password) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		})
		return
	}

	if (formData.username.length < 3 || formData.username.length > 20) {
		uni.showToast({
			title: '用户名长度需在3-20位之间',
			icon: 'none'
		})
		return
	}

	if (formData.password.length < 6 || formData.password.length > 20) {
		uni.showToast({
			title: '密码长度需在6-20位之间',
			icon: 'none'
		})
		return
	}

	loading.value = true

	if (isLoginMode.value) {
		loginAPP(formData).then((res) => {
			loading.value = false
			setUserInfo(res.data)
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})
			console.log('登录成功:', res)
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/Home/Home'
				})
			}, 1500)
		}).catch((error) => {
			loading.value = false
			console.error('登录失败:', error)
		})
	} else {
		registerAPP(formData).then((res) => {
			loading.value = false
			uni.showToast({
				title: '注册成功，请登录',
				icon: 'success'
			})
			console.log('注册成功:', res)
			isLoginMode.value = true
			formData.username = ''
			formData.password = ''
		}).catch((error) => {
			loading.value = false
			console.error('注册失败:', error)
		})
	}
}

const switchMode = () => {
	isLoginMode.value = !isLoginMode.value
	formData.username = ''
	formData.password = ''
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	display: flex;
	box-sizing: border-box;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 50rpx;
	flex: 1;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
	text-align: center;
	margin-bottom: 80rpx;
	width: 100%;
}

.title {
	display: block;
	font-size: 60rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 20rpx;
}

.subtitle {
	display: block;
	font-size: 32rpx;
	color: rgba(255, 255, 255, 0.9);
}

.form {
	width: 100%;
	max-width: 600rpx;
	background: #ffffff;
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.input-field {
	margin-bottom: 30rpx;
	background: #f8f9fa;
	border-radius: 10rpx;
	padding: 20rpx !important;
}

.submit-btn {
	margin-top: 20rpx;
	height: 90rpx;
	font-size: 32rpx;
	border-radius: 45rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
}

.switch-mode {
	margin-top: 40rpx;
	text-align: center;
}

.switch-text {
	color: #667eea;
	font-size: 28rpx;
}
</style>
