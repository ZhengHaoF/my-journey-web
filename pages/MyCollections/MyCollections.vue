<template>
	<my-page-container>
		<view class="collections-page">
			<!-- 收藏点位列表 -->
			<view v-if="collectList.length > 0" class="list-container">
				<view
					v-for="item in collectList"
					:key="item.uuid"
					class="collect-card"
					@click="handleCardClick(item.uuid)"
				>
					<view class="card-header">
						<view class="location-icon">
							<up-icon name="map" size="24" color="#667eea"></up-icon>
						</view>
						<view class="card-info">
							<text class="card-title">{{ item.title }}</text>
							<text class="card-address" v-if="item.address">{{ item.address }}</text>
						</view>
						<up-icon name="arrow-right" size="20" color="#ccc"></up-icon>
					</view>
					<view class="card-footer" v-if="item.remark">
						<text class="remark-text">{{ item.remark }}</text>
					</view>
					<view class="card-footer">
						<up-icon name="clock" size="14" color="#999"></up-icon>
						<text class="time-text">{{ formatTime(item.createTime) }}</text>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!loading" class="empty-state">
				<up-icon name="star" size="120" color="#ddd"></up-icon>
				<text class="empty-text">还没有收藏点位</text>
				<text class="empty-hint">点击右下角"+"添加收藏点位</text>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-state">
				<up-loading-icon></up-loading-icon>
			</view>

			<!-- 悬浮新建按钮 -->
			<view class="fab-container">
				<view class="fab-button" @click="handleCreateCollect">
					<up-icon name="plus" size="32" color="#fff"></up-icon>
				</view>
			</view>
		</view>
	</my-page-container>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getCollectList } from '../../api/api'
import { hasLogin } from '../../utils/tools'
import myPageContainer from '../../components/my-page-container/my-page-container.vue'

const collectList = ref([])
const loading = ref(false)

onLoad(() => {
	loadCollectList()
})

onShow(() => {
	loadCollectList()
})

const loadCollectList = () => {
	if (!hasLogin()) {
		uni.reLaunch({
			url: '/pages/index/index'
		})
		return
	}

	loading.value = true
	getCollectList().then((res) => {
		loading.value = false
		if (res.code === 200) {
			collectList.value = res.data || []
			console.log('获取收藏点位列表成功:', collectList.value)
		} else {
			uni.showToast({
				title: res.message || '获取收藏点位列表失败',
				icon: 'none'
			})
		}
	}).catch((error) => {
		loading.value = false
		console.error('获取收藏点位列表失败:', error)
		uni.showToast({
			title: '网络错误',
			icon: 'none'
		})
	})
}

const handleCardClick = (uuid) => {
	uni.navigateTo({
		url: `/pages/PointEditing/PointEditing?uuid=${uuid}`
	})
}

const handleCreateCollect = () => {
	uni.navigateTo({
		url: '/pages/PointEditing/PointEditing'
	})
}

const formatTime = (time) => {
	if (!time) return ''
	const date = new Date(time)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}
</script>

<style scoped>
.collections-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 20rpx;
	padding-bottom: 120rpx;
}

.list-container {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.collect-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.collect-card:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.card-header {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.location-icon {
	width: 48rpx;
	height: 48rpx;
	background: #f0f2ff;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.card-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-address {
	font-size: 24rpx;
	color: #999;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-footer {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-top: 16rpx;
	padding-top: 16rpx;
	border-top: 1rpx solid #f0f0f0;
}

.remark-text {
	font-size: 24rpx;
	color: #666;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.time-text {
	font-size: 24rpx;
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
