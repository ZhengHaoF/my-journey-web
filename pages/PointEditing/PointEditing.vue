<template>
	<my-page-container :showBottomActions="true">
		<template #bottom-actions>
			<view class="bottom-actions">
				<!-- 编辑模式：显示删除和保存按钮 -->
				<template v-if="isEditMode">
					<up-button
						type="error"
						plain
						:loading="deleteLoading"
						:disabled="deleteLoading"
						@click="handleDelete"
					>
						删除收藏
					</up-button>
					<up-button
						type="primary"
						:loading="submitLoading"
						:disabled="submitLoading"
						@click="handleSubmit"
					>
						保存修改
					</up-button>
				</template>
				<!-- 创建模式：显示创建按钮 -->
				<template v-else>
					<up-button
						type="primary"
						:loading="submitLoading"
						:disabled="submitLoading"
						@click="handleSubmit"
					>
						保存收藏点
					</up-button>
				</template>
			</view>
		</template>
		<view class="point-editing-page">
			<view class="search"><up-search placeholder="请输入地点名称" v-model="keyword" :showAction="false"></up-search></view>
			<view 
			v-if="suggestionList.length > 0 && suggestionShow"
			style="max-height: 200px;
			position: absolute;
			top: 100rpx;
			width: 710rpx;
			z-index: 99999;
			background-color: white;
			overflow-y: auto;
			left: 50%;
			transform: translate(-50%);
			border: 1px solid #EAEBEC;
			border-radius: 10px;
			">
				<view v-for="item in suggestionList" style="border-bottom: 1rpx solid #EAEBEC;padding:20rpx 10rpx;" @click="clickSuggestion(item)">
					<view>{{item.title}}</view>
					<view style="font-size: 24rpx;color: #666;">{{`${item.province}-${item.city}-${item.district}`}}</view>
				</view>
			</view>
			<!-- 地图区域 -->
			<view class="map-section">
				<map 
					id="map1" 
					style="width: 100%; height: 350px;" 
					:latitude="centerLatitude" 
					:longitude="centerLongitude" 
					:markers="markers"
					:controls="getControls"
					:show-location="true"
					:enable-traffic="true"
					@markertap="handleMarkerTap"
				></map>
				
				<!-- 添加/重选收藏点按钮 -->
				<view class="map-actions">
					<up-button 
						type="primary" 
						:icon="hasMarker ? 'reload' : 'plus'"
						:text="hasMarker ? '重选收藏点' : '添加收藏点'"
						@click="handleSelectPoint"
					></up-button>
				</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-section">
				<up-form :model="formData" :rules="rules" ref="formRef" labelPosition="left" :labelWidth="80">
					<!-- 地点名称 -->
					<up-form-item label="地点名称" prop="title">
						<up-input
							v-model="formData.title"
							placeholder="请输入地点名称，如：五四广场"
							maxlength="64"
							clearable
						/>
					</up-form-item>

					<!-- 纬度（不可编辑） -->
					<up-form-item label="纬度" prop="latitude" v-if="false">
						<up-input
							v-model="formData.latitude"
							placeholder="请先在地图上选择位置"
							disabled
							disabledColor="#f5f5f5"
						/>
					</up-form-item>

					<!-- 经度（不可编辑） -->
					<up-form-item label="经度" prop="longitude" v-if="false">
						<up-input
							v-model="formData.longitude"
							placeholder="请先在地图上选择位置"
							disabled
							disabledColor="#f5f5f5"
						/>
					</up-form-item>

					<!-- 详细地址 -->
					<up-form-item label="详细地址" prop="address" >
						<up-input
							v-model="formData.address"
							placeholder="请输入详细地址（可选）"
							maxlength="255"
							clearable
						/>
					</up-form-item>

					<!-- 备注信息 -->
					<up-form-item label="备注信息" prop="remark">
						<up-textarea
							v-model="formData.remark"
							placeholder="请输入备注信息，如：吃饭、拍照、打卡（可选）"
							maxlength="255"
							:height="100"
							:showWordCount="true"
						/>
					</up-form-item>
				</up-form>

				<!-- 提示信息 -->
				<view class="form-hint">
					<up-icon name="info-circle" size="16" color="#999"></up-icon>
					<text class="hint-text">请先在地图上选择收藏点位置，系统将自动获取经纬度</text>
				</view>
			</view>
		</view>
	</my-page-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createCollect, updateCollect, getCollectDetail, deleteCollect, getGeocoder, getSuggestion } from '../../api/api'
import { hasLogin } from '../../utils/tools'
import myPageContainer from '../../components/my-page-container/my-page-container.vue'

const formRef = ref(null)
const collectUuid = ref('')
const submitLoading = ref(false)
const deleteLoading = ref(false)
const centerLatitude = ref(39.909)
const centerLongitude = ref(116.39742)
const markers = ref([])
const showControl = ref(true)
const currentMarkerId = ref(null)


//地点提示功能
const keyword = ref('');
const suggestionShow = ref(false);
const suggestionList = ref([]);
watch(keyword,  (newVal) => {
	suggestionList.value = [];
	if (newVal && newVal.trim() && newVal.trim().length > 1) {
		 getSuggestion({
			keyword: newVal.trim()
		}).then(res => {
			if (res.code === 200) {
				suggestionShow.value = true;
				suggestionList.value = res.data
			}
		})
	}
})

const clickSuggestion = (item)=>{
	suggestionShow.value = false;
	formData.title = item.title;
	formData.address = item.address;
	formData.latitude = item.location.lat;
	formData.longitude = item.location.lng;
	
	centerLatitude.value = item.location.lat;
	centerLongitude.value = item.location.lng;
}


const formData = reactive({
	title: '',
	latitude: '',
	longitude: '',
	address: '',
	remark: ''
})

const rules = {
	title: [
		{
			required: true,
			message: '请输入地点名称',
			trigger: ['blur', 'change']
		},
		{
			maxLength: 64,
			message: '地点名称不能超过64个字符',
			trigger: ['blur', 'change']
		}
	],
	latitude: [
		{
			required: true,
			message: '请先在地图上选择位置',
			trigger: ['blur', 'change']
		}
	],
	longitude: [
		{
			required: true,
			message: '请先在地图上选择位置',
			trigger: ['blur', 'change']
		}
	],
	address: [
		{
			maxLength: 255,
			message: '详细地址不能超过255个字符',
			trigger: ['blur', 'change']
		}
	],
	remark: [
		{
			maxLength: 255,
			message: '备注信息不能超过255个字符',
			trigger: ['blur', 'change']
		}
	]
}

const isEditMode = computed(() => !!collectUuid.value)

const hasMarker = computed(() => {
	return markers.value.length > 0
})

const controls = computed(() => {
	return [{
		id: 1,
		iconPath: '/static/tack.png',
		position: {
			left: (uni.getWindowInfo().windowWidth - 75) / 2,
			top: (350 - 125) / 2,
			width: 50,
			height: 50
		}
	}]
})

const getControls = computed(() => {
	return showControl.value ? controls.value : []
})

onLoad(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const options = currentPage.options || {}
	collectUuid.value = options.uuid || ''

	if (!hasLogin()) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		setTimeout(() => {
			uni.reLaunch({
				url: '/pages/index/index'
			})
		}, 1500)
		return
	}

	if (isEditMode.value) {
		loadCollectDetail()
		  uni.setNavigationBarTitle({
			title: '收藏点编辑'
		})
	} else {
		initCurrentLocation()
		  uni.setNavigationBarTitle({
			title: '新建收藏点'
		})
	}
	

	
})

const initCurrentLocation = () => {
	uni.getLocation({
		type: 'gcj02',
		success: (res) => {
			console.log('当前位置：', res)
			centerLatitude.value = res.latitude
			centerLongitude.value = res.longitude
		},
		fail: (err) => {
			console.log('获取位置失败：', err)
		}
	})
}

const loadCollectDetail = () => {
	if (!collectUuid.value) return

	uni.showLoading({ title: '加载中...' })
	getCollectDetail(collectUuid.value)
		.then((res) => {
			uni.hideLoading()
			if (res.code === 200 && res.data) {
				const data = res.data
				formData.title = data.title || ''
				formData.latitude = String(data.latitude || '')
				formData.longitude = String(data.longitude || '')
				formData.address = data.address || ''
				formData.remark = data.remark || ''
				
				if (data.latitude && data.longitude) {
					centerLatitude.value = data.latitude
					centerLongitude.value = data.longitude
					currentMarkerId.value = Date.now()
					markers.value = [{
						id: currentMarkerId.value,
						latitude: data.latitude,
						longitude: data.longitude,
						width: 30,
						height: 30,
						iconPath: '/static/start.png',
						title: data.title || '收藏点'
					}]
				}
				
				console.log('加载收藏点位详情成功:', data)
			} else {
				uni.showToast({
					title: res.message || '加载收藏点位详情失败',
					icon: 'none'
				})
			}
		})
		.catch((error) => {
			uni.hideLoading()
			console.error('加载收藏点位详情失败:', error)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		})
}

const handleMarkerTap = (e) => {
	const marker = markers.value.find(item => item.id === e.detail.markerId)
	if (marker) {
		console.log('点击了标记点:', marker)
	}
}

const handleSelectPoint = () => {
	const map1 = uni.createMapContext("map1", this)
	map1.getCenterLocation({
		success: (res) => {
			console.log("地图中心点坐标：", res)
			console.log("纬度：", res.latitude)
			console.log("经度：", res.longitude)
			
			currentMarkerId.value = Date.now()
			markers.value = [{
				id: currentMarkerId.value,
				latitude: res.latitude,
				longitude: res.longitude,
				width: 30,
				height: 30,
				iconPath: '/static/start.png',
				title: formData.title || '收藏点'
			}]
			
			formData.latitude = String(res.latitude)
			formData.longitude = String(res.longitude)
			getGeocoder({
				latitude: res.latitude,
				longitude: res.longitude
			}).then((res)=>{
				if(res.code === 200){
					console.log(res.result.formatted_addresses.recommend,123456789)
					formData.title = res?.result?.formatted_addresses?.recommend || ''
				}
			})
					
			uni.showToast({
				title: '已选择收藏点位置',
				icon: 'success'
			})
		},
		fail: (err) => {
			console.log("获取失败：", err)
			uni.showToast({
				title: '获取位置失败，请检查地图权限',
				icon: 'none'
			})
		}
	})
}

const handleSubmit = async () => {
	try {
		await formRef.value.validate()
	} catch (e) {
		console.log('表单验证失败:', e)
		return
	}

	submitLoading.value = true

	const submitData = {
		title: formData.title,
		latitude: parseFloat(formData.latitude),
		longitude: parseFloat(formData.longitude),
		address: formData.address || "",
		remark: formData.remark || ""
	}

	if (isEditMode.value) {
		updateCollect(collectUuid.value, submitData)
			.then((res) => {
				submitLoading.value = false
				if (res.code === 200) {
					uni.showToast({
						title: '修改成功',
						icon: 'success'
					})
					uni.navigateBack()
				} else {
					uni.showToast({
						title: res.message || '修改失败',
						icon: 'none'
					})
				}
			})
			.catch((error) => {
				submitLoading.value = false
				console.error('修改收藏点位失败:', error)
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				})
			})
	} else {
		createCollect(submitData)
			.then((res) => {
				submitLoading.value = false
				if (res.code === 200) {
					uni.showToast({
						title: '创建成功',
						icon: 'success'
					})
					uni.navigateBack()
				} else {
					uni.showToast({
						title: res.message || '创建失败',
						icon: 'none'
					})
				}
			})
			.catch((error) => {
				submitLoading.value = false
				console.error('创建收藏点位失败:', error)
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				})
			})
	}
}

const handleDelete = () => {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这个收藏点吗？删除后无法恢复。',
		confirmColor: '#ff4d4f',
		success: (res) => {
			if (res.confirm) {
				performDelete()
			}
		}
	})
}

const performDelete = () => {
	deleteLoading.value = true
	deleteCollect(collectUuid.value)
		.then((res) => {
			deleteLoading.value = false
			if (res.code === 200) {
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				})
				uni.navigateBack()
			} else {
				uni.showToast({
					title: res.message || '删除失败',
					icon: 'none'
				})
			}
		})
		.catch((error) => {
			deleteLoading.value = false
			console.error('删除收藏点位失败:', error)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		})
}
</script>

<style lang="scss" scoped>
.point-editing-page {
	min-height: 100vh;
	background: #f5f5f5;
	.search{
		padding: 20rpx 20rpx 0 20px;	
		background: #ffffff;
	}
}

.page-header {
	background: #ffffff;
	padding: 30rpx 20rpx;
	border-bottom: 1rpx solid #e0e0e0;
}

.page-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.map-section {
	position: relative;
	background: #ffffff;
	padding: 20rpx;
	border-bottom: 1rpx solid #e0e0e0;
}

.map-actions {
	margin-top: 20rpx;
	display: flex;
	justify-content: center;
}

.form-section {
	padding: 30rpx 20rpx;
	background: #ffffff;
	margin-top: 20rpx;
}

.form-hint {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 20rpx;
	background: #f8f8f8;
	border-radius: 8rpx;
	margin-top: 20rpx;
}

.hint-text {
	font-size: 24rpx;
	color: #999;
	line-height: 1.5;
}

.bottom-actions {
	display: flex;
	gap: 20rpx;
	justify-content: space-between;
	
	.up-button {
		flex: 1;
	}
}
</style>
