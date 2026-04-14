<template>
	<my-page-container>
		<view class="home-container">
			<map 
				id="homeMap" 
				class="full-screen-map" 
				:latitude="latitude" 
				:longitude="longitude" 
				:markers="markers"
				:show-location="true"
				:enable-traffic="true"
				:show-compass="true"
				:show-scale="true"
				:enable-rotate="true"
				@markertap="handleMarkerTap"
			></map>
			
			<view class="location-control" @click="getLocation">
				<image src="/static/radar.png" mode="aspectFit" class="location-icon"></image>
			</view>
		</view>
	</my-page-container>
</template>

<script setup>
	import { ref } from 'vue'
	import { onShow, onLoad, onReady } from '@dcloudio/uni-app'
	import { getCollectList } from '../../api/api'
	
	const latitude = ref(39.909)
	const longitude = ref(116.39742)
	const markers = ref([])
	let mapContext = null
	
	onShow(() => {
		loadCollectPoints()
	})

	onLoad(() => {
		getLocation()
	})
	
	onReady(() => {
		mapContext = uni.createMapContext('homeMap', this)
	})
	
	const loadCollectPoints = () => {
		getCollectList()
			.then((res) => {
				if (res.code === 200 && res.data) {
					console.log('加载收藏点列表成功：', res.data)
					
					const collectMarkers = res.data.map((item, index) => {
						return {
							id: 100 + index,
							latitude: item.latitude,
							longitude: item.longitude,
							width: 30,
							height: 30,
							iconPath: '/static/start.png',
							title: item.title,
							callout: {
								content: item.title,
								color: '#333333',
								fontSize: 14,
								borderRadius: 10,
								bgColor: '#ffffff',
								padding: 10,
								display: 'ALWAYS'
							}
						}
					})
					
					markers.value = [...collectMarkers]
					
					console.log('地图标记已添加：', markers.value)
				} else {
					console.error('加载收藏点列表失败：', res.message)
				}
			})
			.catch((error) => {
				console.error('加载收藏点列表失败：', error)
			})
	}
	
	const getLocation = () => {
		uni.getLocation({
			type: 'gcj02',
			success: (res) => {
				console.log('当前位置：', res)
				latitude.value = res.latitude
				longitude.value = res.longitude
				
				if (mapContext) {
					mapContext.moveToLocation({
						longitude: res.longitude,
						latitude: res.latitude,
						success: () => {
							console.log('地图中心已移动到当前位置')
						},
						fail: (err) => {
							console.error('移动地图中心失败：', err)
						}
					})
				}
			},
			fail: (err) => {
				console.error('获取位置失败：', err)
				uni.showToast({
					title: '获取位置失败',
					icon: 'none'
				})
			}
		})
	}
	
	const handleMarkerTap = (e) => {
		console.log('点击标记点：', e.detail)
		
		const markerId = e.detail.markerId
		const marker = markers.value.find(item => item.id === markerId)
		
		if (marker) {
			uni.openLocation({
				latitude: marker.latitude,
				longitude: marker.longitude,
				name: marker.title || '收藏点',
				success: () => {
					console.log('打开导航成功')
				},
				fail: (err) => {
					console.error('打开导航失败：', err)
					uni.showToast({
						title: '打开导航失败',
						icon: 'none'
					})
				}
			})
		}
	}
</script>

<style lang="scss" scoped>
	.home-container {
		width: 100%;
		height: 100%;
		position: relative;
	}
	
	.full-screen-map {
		width: 100%;
		height: 100%;
	}
	
	.location-control {
		position: fixed;
		right: 30rpx;
		bottom: 150rpx;
		width: 100rpx;
		height: 100rpx;
		background: #ffffff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		z-index: 999;
	}
	
	.location-icon {
		width: 60rpx;
		height: 60rpx;
	}
</style>