<template>
	<my-page-container>
		<view class="mine-container">
			<up-cell-group>
				<up-cell
					icon="account"
					title="我的信息"
					isLink
					@click="goToMyInfo"
				></up-cell>
				<up-cell
					icon="star"
					title="我的收藏"
					isLink
					@click="goToMyFavorites"
				></up-cell>
				<up-cell
					icon="setting"
					title="设置"
					isLink
					@click="goToSettings"
				></up-cell>
				<up-cell
					icon="map"
					title="跳转去地图测试页"
					isLink
					@click="gotoMap"
				></up-cell>
				<up-cell
					icon="close"
					title="退出登录"
					isLink
					@click="handleLogout"
				></up-cell>
			</up-cell-group>
		</view>
	</my-page-container>
</template>

<script setup>
	const goToMyInfo = () => {
		// TODO: 跳转到我的信息页面
		console.log('点击了我的信息')
	}

	const goToMyFavorites = () => {
		// TODO: 跳转到我的收藏页面
		console.log('点击了我的收藏')
		uni.navigateTo({
			url: '/pages/MyCollections/MyCollections'
		})
	}

	const goToSettings = () => {
		// TODO: 跳转到设置页面
		console.log('点击了设置')
	}
	const gotoMap = () =>{
		uni.navigateTo({
			url: '/pages/maptest/maptest'
		})
	}

	const handleLogout = () => {
		uni.showModal({
			title: '提示',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					uni.clearStorageSync()
					uni.reLaunch({
						url: '/pages/index/index'
					})
				}
			}
		})
	}
</script>

<style lang="scss">
.mine-container {
	padding: 20rpx;
}
</style>