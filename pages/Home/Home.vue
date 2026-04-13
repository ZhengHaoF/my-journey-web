<template>
	<my-page-container>
		<view class="home-container">
			<up-button type="primary" @click="testGetUserInfo">测试获取用户信息</up-button>
		</view>
	</my-page-container>
</template>

<script setup>
	import {
		getUserInfo
	} from '../../utils/tools'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	const testGetUserInfo = () => {
		const userInfo = getUserInfo()
		console.log(userInfo)

		if (userInfo) {
			uni.showToast({
				title: '用户信息获取成功',
				icon: 'success'
			})
		} else {
			uni.showToast({
				title: '用户信息获取失败',
				icon: 'none'
			})
		}
	}
</script>

<style lang="scss">
	.home-container {
		padding: 20rpx;
	}
</style>