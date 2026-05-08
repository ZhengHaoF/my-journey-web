<template>
	<my-page-container>
		<view class="map-display-container">
			<map
				id="tripMap"
				class="full-screen-map"
				:latitude="latitude"
				:longitude="longitude"
				:markers="markers"
				:polyline="polyline"
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
			
			<view class="back-control" @click="goBack">
				<up-icon name="arrow-left" color="#333" size="24"></up-icon>
			</view>
		</view>
	</my-page-container>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { getTripDetail, batchGetCollect } from '../../api/api'
	import { startNavigation } from '../../utils/tools'
	import myPageContainer from '../../components/my-page-container/my-page-container.vue'
	import _ from 'lodash'
	
	const latitude = ref(39.909)
	const longitude = ref(116.39742)
	const markers = ref([])
	const polyline = ref([])
	let tripUuid = ''
	let mapContext = null
	
	onLoad(() => {
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		const options = currentPage.options || {}
		tripUuid = options.uuid || ''
		
		if (!tripUuid) {
			uni.showToast({
				title: '缺少行程ID',
				icon: 'none'
			})
			setTimeout(() => {
				goBack()
			}, 1500)
			return
		}
	})
	
	onMounted(() => {
		setTimeout(() => {
			mapContext = uni.createMapContext('tripMap', this)
			loadTripDetail()
		}, 100)
	})
	
	const loadTripDetail = () => {
		if (!tripUuid) return
		
		uni.showLoading({ title: '加载中...' })
		getTripDetail(tripUuid)
			.then((res) => {
				uni.hideLoading()
				if (res.code === 200 && res.data) {
					const data = res.data
					console.log('加载行程详情成功：', data)
					
					processRoutePlan(data.routePlan || [])
				} else {
					uni.showToast({
						title: res.message || '加载行程详情失败',
						icon: 'none'
					})
				}
			})
			.catch((error) => {
				uni.hideLoading()
				console.error('加载行程详情失败：', error)
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				})
			})
	}
	
	const processRoutePlan = (routePlan) => {
		if (!routePlan || routePlan.length === 0) {
			uni.showToast({
				title: '暂无点位数据',
				icon: 'none'
			})
			return
		}
		
		let uuids = []
		routePlan.forEach((item) => {
			if (item.uuid) {
				uuids.push(item.uuid)
			}
			_.get(item, 'satelliteAttractionList', []).forEach((satellite) => {
				if (satellite.uuid) {
					uuids.push(satellite.uuid)
				}
			})
		})
		
		if (uuids.length > 0) {
			batchGetCollect({ uuids })
				.then((res) => {
					if (res.code === 200 && res.data) {
						const collectData = res.data
						
						const mainMarkers = []
						const satelliteMarkers = []
						const points = []
						
						routePlan.forEach((item, mainIndex) => {
							const mainCollect = _.find(collectData, { uuid: item.uuid })
							if (mainCollect && mainCollect.latitude && mainCollect.longitude) {
								mainMarkers.push({
									id: 100 + mainIndex,
									latitude: mainCollect.latitude,
									longitude: mainCollect.longitude,
									width: 25,
									height: 25,
									iconPath: '/static/start.png',
									title: mainCollect.title,
									callout: {
										content: mainCollect.title,
										color: '#333333',
										fontSize: 14,
										borderRadius: 10,
										bgColor: '#ffffff',
										padding: 10,
										display: 'ALWAYS'
									}
								})
								
								points.push({
									latitude: mainCollect.latitude,
									longitude: mainCollect.longitude
								})
								
								_.get(item, 'satelliteAttractionList', []).forEach((satellite, satelliteIndex) => {
									const satelliteCollect = _.find(collectData, { uuid: satellite.uuid })
									if (satelliteCollect && satelliteCollect.latitude && satelliteCollect.longitude) {
										const markerId = 200 + mainIndex * 100 + satelliteIndex
										satelliteMarkers.push({
											id: markerId,
											latitude: satelliteCollect.latitude,
											longitude: satelliteCollect.longitude,
											width: 25,
											height: 25,
											iconPath: '/static/tack.png',
											title: satelliteCollect.title,
											callout: {
												content: satelliteCollect.title,
												color: '#333333',
												fontSize: 12,
												borderRadius: 8,
												bgColor: '#f0f9eb',
												padding: 8,
												display: 'ALWAYS'
											}
										})
										
										points.push({
											latitude: satelliteCollect.latitude,
											longitude: satelliteCollect.longitude
										})
									}
								})
							}
						})
						
						markers.value = [...mainMarkers, ...satelliteMarkers]
						
						if (points.length > 0) {
							polyline.value = [{
								points: points,
								color: '#5DAE60',
								width: 3,
								dottedLine: false
							}]
							
							latitude.value = points[0].latitude
							longitude.value = points[0].longitude
						}
						
						console.log('地图标记已添加：', markers.value)
						console.log('路线已绘制：', polyline.value)
					} else {
						uni.showToast({
							title: res.message || '加载收藏点位失败',
							icon: 'none'
						})
					}
				})
		} else {
			uni.showToast({
				title: '暂无点位数据',
				icon: 'none'
			})
		}
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
			startNavigation(marker.latitude, marker.longitude)
		}
	}
	
	const goBack = () => {
		uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	.map-display-container {
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
	
	.back-control {
		position: fixed;
		left: 30rpx;
		top: 150rpx;
		width: 80rpx;
		height: 80rpx;
		background: #ffffff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		z-index: 999;
	}
</style>
