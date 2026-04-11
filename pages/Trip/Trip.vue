<template>
	<my-page-container>
		<view class="trip-page">
			<!-- 瀑布流列表 -->
			<view v-if="tripList.length > 0" class="waterfall-container">
				<view class="waterfall-left">
					<view
						v-for="(item, index) in leftList"
						:key="item.uuid"
						class="trip-card"
						@click="handleCardClick(item.uuid)"
					>
						<image
							:src="item.cover || defaultImage"
							mode="widthFix"
							class="card-image"
							lazy-load
						/>
						<view class="card-content">
							<text class="card-title">{{ item.title }}</text>
							<text class="card-text" v-if="item.text">{{ item.text }}</text>
							<view class="card-date">
								<up-icon name="calendar" size="14" color="#999"></up-icon>
								<text class="date-text">{{ item.startDate }} ~ {{ item.endDate }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="waterfall-right">
					<view
						v-for="(item, index) in rightList"
						:key="item.uuid"
						class="trip-card"
						@click="handleCardClick(item.uuid)"
					>
						<image
							:src="item.cover || defaultImage"
							mode="widthFix"
							class="card-image"
							lazy-load
						/>
						<view class="card-content">
							<text class="card-title">{{ item.title }}</text>
							<text class="card-text" v-if="item.text">{{ item.text }}</text>
							<view class="card-date">
								<up-icon name="calendar" size="14" color="#999"></up-icon>
								<text class="date-text">{{ item.startDate }} ~ {{ item.endDate }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<up-icon name="map" size="120" color="#ddd"></up-icon>
				<text class="empty-text">还没有行程</text>
				<text class="empty-hint">点击右下角"+"开始规划您的旅程</text>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-state">
				<up-loading-icon></up-loading-icon>
			</view>

			<!-- 悬浮新建按钮 -->
			<view class="fab-container">
				<view class="fab-button" @click="handleCreateTrip">
					<up-icon name="plus" size="32" color="#fff"></up-icon>
				</view>
			</view>
		</view>
	</my-page-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getTripList } from '../../api/api'
import { hasLogin } from '../../utils/tools'
import myPageContainer from '../../components/my-page-container/my-page-container.vue'

const tripList = ref([])
const loading = ref(false)
const defaultImage = 'https://placehold.co/400x200/007bff/white?text=Banner'


onLoad(() => {
	loadTripList()
})

onShow(() => {
	loadTripList()
})

const loadTripList = () => {
	if (!hasLogin()) {
		uni.reLaunch({
			url: '/pages/index/index'
		})
		return
	}

	loading.value = true
	getTripList().then((res) => {
		loading.value = false
		if (res.code === 200) {
			tripList.value = res.data || []
			console.log('获取行程列表成功:', tripList.value)
		} else {
			uni.showToast({
				title: res.message || '获取行程列表失败',
				icon: 'none'
			})
		}
	}).catch((error) => {
		loading.value = false
		console.error('获取行程列表失败:', error)
		uni.showToast({
			title: '网络错误',
			icon: 'none'
		})
	})
}

const leftList = computed(() => {
	return tripList.value.filter((item, index) => index % 2 === 0)
})

const rightList = computed(() => {
	return tripList.value.filter((item, index) => index % 2 === 1)
})

const handleCreateTrip = () => {
	uni.navigateTo({
		url: '/pages/TripDetails/TripDetails'
	})
}

const handleCardClick = (uuid) => {
	uni.navigateTo({
		url: `/pages/TripDetails/TripDetails?uuid=${uuid}`
	})
}
</script>

<style scoped>
.trip-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding-bottom: 20rpx;
}

.waterfall-container {
	display: flex;
	padding: 20rpx;
	gap: 20rpx;
}

.waterfall-left,
.waterfall-right {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.trip-card {
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.trip-card:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.card-image {
	width: 100%;
	display: block;
}

.card-content {
	padding: 20rpx;
}

.card-title {
	display: block;
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-text {
	display: block;
	font-size: 24rpx;
	color: #666;
	margin-bottom: 15rpx;
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-date {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.date-text {
	font-size: 22rpx;
	color: #999;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #999;
	margin-top: 30rpx;
	font-weight: bold;
}

.empty-hint {
	font-size: 24rpx;
	color: #ccc;
	margin-top: 15rpx;
	text-align: center;
	padding: 0 50rpx;
}

.loading-state {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 50rpx 0;
}

.fab-container {
	position: fixed;
	right: 40rpx;
	bottom: 120rpx;
	z-index: 999;
}

.fab-button {
	width: 110rpx;
	height: 110rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.4);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.fab-button:active {
	transform: scale(0.9);
	box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
}
</style>
