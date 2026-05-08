<template>
	<my-page-container>
		<view class="home-container">
			<view class="trips-list" v-if="tripList.length > 0">
				<view v-for="(trip, tripIndex) in tripList" :key="tripIndex" class="trip-card">
					<view class="trip-header">
						<view class="trip-title" @click="goToTripDetail(trip.uuid)">{{ trip.title }}</view>
						<up-tag text="进行中" type="success" plain size="mini"></up-tag>
					</view>
					<view class="trip-date">
						<up-icon name="calendar" size="16" color="#999"></up-icon>
						<text>{{ trip.startDate }} 至 {{ trip.endDate }}</text>
					</view>
					<view class="trip-remark" v-if="trip.text">{{ trip.text }}</view>
					<!-- <view style="display: flex;gap: 10rpx;">
						<up-button size="small"><text style="font-size: 28rpx;">🚶‍♀️</text></up-button>
						<up-button size="small"><text style="font-size: 28rpx;">🚲</text></up-button>
						<up-button size="small"><text style="font-size: 28rpx;">🚗</text></up-button>
					</view> -->
					<view class="attraction-section">
						<view class="attraction-container">
							<view v-for="(item, index) in trip.routePlan" :key="index" class="attraction-item">
								<view class="attraction-content">
									<view class="attraction-header">
										<up-icon :name="currentAttractionIndex.trip === tripIndex && currentAttractionIndex.index === index ? 'map-fill' : 'map'" color="#5DAE60" size="30" @click="startNavigation(item.latitude, item.longitude)"></up-icon>
										<view class="attraction-info">
											<view class="attraction-actions">
												<view class="attraction-title">{{ item.title }}</view>
												<view @click="toggleExpand(tripIndex, index)">
													<up-icon :name="expandedItems[tripIndex]?.[index] ? 'arrow-up' : 'arrow-down'" color="#5DAE60" size="25"></up-icon>
												</view>
											</view>
											<view class="attraction-remark">{{ item.remark }}</view>
										</view>
									</view>
									<up-transition :show="expandedItems[tripIndex]?.[index]" mode="fade" :duration="200">
										<view class="satellite-container" v-if="item.satelliteAttractionList && item.satelliteAttractionList.length > 0">
											<view class="satellite-list" v-for="(item2, index2) in item.satelliteAttractionList" :key="index2">
												<uni-icons :type="currentAttractionIndex.trip === tripIndex && currentAttractionIndex.index === index ? 'paperplane-filled' : 'paperplane'" size="20" color="#5DAE60" @click="startNavigation(item2.latitude, item2.longitude)"></uni-icons>
												<view class="satellite-item">
													<view style="display: flex;align-items: center;">
														<text>{{ item2.title }}</text>
													</view>
													<text class="satellite-remark">{{ item2.remark }}</text>
												</view>
											</view>
										</view>
									</up-transition>
								</view>
							</view>
						</view>
						<view v-if="!trip.routePlan || trip.routePlan.length === 0" class="empty-attractions">
							<text>暂无景点</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="empty-state" v-else>
				<up-icon name="car" size="80" color="#ccc"></up-icon>
				<text class="empty-text">暂无开启的行程</text>
				<text class="empty-hint">请前往行程详情页创建并开启行程</text>
			</view>
		</view>
	</my-page-container>
</template>

<script setup>
	import { ref, reactive } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import { getEnabledTrip, batchGetCollect } from '../../api/api'
	import { hasLogin, startNavigation } from '../../utils/tools'
	import _ from 'lodash'
	import myPageContainer from '../../components/my-page-container/my-page-container.vue'
	
	const tripList = ref([])
	const expandedItems = ref({})
	const currentAttractionIndex = ref({ trip: -1, index: -1 })
	const loading = ref(false)
	
	onShow(() => {
		if (hasLogin()) {
			loadEnabledTrips()
		}
	})
	
	const loadEnabledTrips = () => {
		loading.value = true
		uni.showLoading({ title: '加载中...' })
		
		getEnabledTrip()
			.then((res) => {
				loading.value = false
				uni.hideLoading()
				
				if (res.code === 200 && res.data) {
					tripList.value = res.data
					tripList.value.forEach((trip, tripIndex) => {
						expandedItems.value[tripIndex] = new Array(trip.routePlan?.length || 0).fill(true)
					})
					
					const allUuids = []
					tripList.value.forEach((trip) => {
						if (trip.routePlan) {
							trip.routePlan.forEach((item) => {
								if (item.uuid) {
									allUuids.push(item.uuid)
								}
								if (item.satelliteAttractionList) {
									item.satelliteAttractionList.forEach((item2) => {
										if (item2.uuid) {
											allUuids.push(item2.uuid)
										}
									})
								}
							})
						}
					})
					
					if (allUuids.length > 0) {
						batchGetCollect({ uuids: allUuids })
							.then((collectRes) => {
								if (collectRes.code === 200 && collectRes.data) {
									tripList.value = tripList.value.map((trip) => {
										if (trip.routePlan) {
											trip.routePlan = trip.routePlan.map((item) => {
												if (item.satelliteAttractionList) {
													item.satelliteAttractionList = item.satelliteAttractionList.map((item2) => {
														if (item2.uuid) {
															return _.find(collectRes.data, { uuid: item2.uuid }) || item2
														}
														return item2
													})
												}
												
												if (item.uuid) {
													return {
														..._.find(collectRes.data, { uuid: item.uuid }),
														satelliteAttractionList: item.satelliteAttractionList
													}
												}
												
												return item
											})
										}
										return trip
									})
								}
							})
					}
				} else {
					uni.showToast({
						title: res.message || '加载开启行程失败',
						icon: 'none'
					})
				}
			})
			.catch((error) => {
				loading.value = false
				uni.hideLoading()
				console.error('加载开启行程失败:', error)
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				})
			})
	}
	
	const toggleExpand = (tripIndex, index) => {
		if (!expandedItems.value[tripIndex]) {
			expandedItems.value[tripIndex] = []
		}
		expandedItems.value[tripIndex][index] = !expandedItems.value[tripIndex][index]
	}
	
	const goToTripDetail = (uuid) => {
		uni.navigateTo({
			url: `/pages/TripDetails/TripDetails?uuid=${uuid}`
		})
	}
</script>

<style lang="scss" scoped>
	.home-container {
		min-height: 100vh;
		background: #f5f5f5;
		padding: 20rpx;
	}
	
	.trips-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	.trip-card {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
		
		.trip-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 16rpx;
			
			.trip-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #303133;
			}
		}
		
		.trip-date {
			display: flex;
			align-items: center;
			gap: 8rpx;
			color: #606266;
			font-size: 26rpx;
			margin-bottom: 12rpx;
		}
		
		.trip-remark {
			color: #909399;
			font-size: 26rpx;
			margin-bottom: 20rpx;
			line-height: 1.5;
		}
	}
	
	.attraction-section {
		margin-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
		padding-top: 20rpx;
		
		.attraction-container {
			.attraction-item {
				margin-bottom: 20rpx;
				
				.attraction-content {
					.attraction-header {
						display: flex;
						gap: 10px;
						align-items: center;
						
						.attraction-info {
							display: flex;
							flex: auto;
							flex-wrap: wrap;
							align-items: center;
							
							.attraction-actions {
								flex: auto;
								display: flex;
								align-items: center;
								gap: 10rpx;
								
								.attraction-title {
									flex: auto;
									font-size: 28rpx;
									color: #303133;
								}
							}
							
							.attraction-remark {
								flex: 100%;
								color: #888;
								font-size: 24rpx;
								margin-top: 4rpx;
							}
						}
					}
					
					.satellite-container {
						min-height: 100rpx;
						border-left: 2rpx solid #5DAE60;
						margin-left: 30rpx;
						margin-top: 20rpx;
						padding-left: 10rpx;
						display: flex;
						flex-wrap: wrap;
						
						.satellite-list {
							display: flex;
							margin-bottom: 10px;
							gap: 8rpx;
							
							.satellite-item {
								display: flex;
								align-items: center;
								flex-wrap: wrap;
								
								.satellite-remark {
									color: #888;
									font-size: 24rpx;
									flex: 100%;
								}
							}
						}
					}
				}
			}
		}
		
		.empty-attractions {
			text-align: center;
			color: #909399;
			font-size: 26rpx;
			padding: 30rpx 0;
		}
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		
		.empty-text {
			font-size: 32rpx;
			color: #606266;
			margin-top: 30rpx;
		}
		
		.empty-hint {
			font-size: 26rpx;
			color: #909399;
			margin-top: 16rpx;
		}
	}
</style>