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
						删除行程
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
						创建行程
					</up-button>
				</template>
			</view>
		</template>
		<view class="trip-details-page">


			<!-- 表单区域 -->
			<view class="form-container">
				<up-form :model="formData" :rules="rules" ref="formRef" labelPosition="left" :labelWidth="80">
					<!-- 行程封面 -->
					<up-form-item label="行程封面" prop="cover">
						<up-input
							v-model="formData.cover"
							placeholder="请输入封面图URL"
							clearable
						/>
					</up-form-item>

					<!-- 行程名称 -->
					<up-form-item label="行程名称" prop="title">
						<up-input
							v-model="formData.title"
							placeholder="请输入行程名称，如：青岛3日游"
							maxlength="64"
							clearable
						/>
					</up-form-item>

					<!-- 日期选择 -->
					<up-form-item label="行程日期" prop="dates">
						<view @click="handleStartDateClick">{{ dateRangeText }}</view>
					</up-form-item>

					<!-- 行程备注 -->
					<up-form-item label="行程备注" prop="text">
						<up-textarea
							v-model="formData.text"
							placeholder="请输入行程备注，如：计划去栈桥、五四广场、崂山"
							maxlength="500"
							:height="120"
							:showWordCount="true"
						/>
					</up-form-item>
				</up-form>
				<view style="margin-bottom:20px">详细内容</view>
				<view class="attraction-section">
					<view class="attraction-container">
						<view v-for="(item,index) in formData.routePlan" :key="index" class="attraction-item">
							<view class="attraction-content">
								<view class="attraction-header">
									<up-icon :name="currentAttractionIndex === index?'map-fill':'map'" color="#5DAE60" size="30" @click="startNavigation(item.latitude,item.longitude)"></up-icon>
									<view class="attraction-info">
										<view class="attraction-actions">
											<view class="attraction-title">{{item.title}}</view>
											<!-- <view><up-button type="error" :plain="true" size="small" icon="trash" @click="handleDeleteAttraction(index)"></up-button></view> -->
											<view @click="handleDeleteAttraction(index)"><up-icon name="trash" color="#f56c6c" size="30"></up-icon></view>
											<view><up-button type="primary" icon="plus" size="small" @click="handleAddSatelliteAttraction(index)"></up-button></view>
										</view>
										<view class="attraction-remark">{{item.remark}}</view>
									</view>
								</view>
								<view class="satellite-container">
									<view class="satellite-list" v-for="(item2,index2) in item.satelliteAttractionList" :key="index2">
										<uni-icons  :type="currentAttractionIndex === index?'paperplane-filled':'paperplane'" size="20" color="#5DAE60" @click="startNavigation(item2.latitude,item2.longitude)"></uni-icons>
										<view class="satellite-item">
											<view style="display: flex;align-items: center;">
												<text>{{item2.title}}</text>
												<up-icon name="trash" color="#f56c6c" size="20" @click="handleDeleteSatelliteAttraction(index, index2)"></up-icon>
											</view>
											<text class="satellite-remark">{{item2.remark}}</text>
										</view>
									</view>
								</view>
							</view>			
						</view>
					</view>
					<view class="add-attraction-btn"><up-button type="primary" icon="plus" text="主景点" @click="handleAddAttraction"></up-button></view>
				</view>
			</view>

			<up-line />

			<!-- 日期选择器弹窗 -->
			<up-calendar
				:show="calendarShow"
				mode="range"
				:defaultDate="calendarDefaultDate"
				@confirm="handleCalendarConfirm"
				@close="calendarShow = false"
			/>

			<!-- 添加地点弹窗 -->
			<up-popup
				:show="attractionPopupShow"
				mode="bottom"
				round="40"
				:closeable="true"
				@close="attractionPopupShow = false"
			>
				<view class="attraction-popup">
					<view class="popup-title">选择收藏地点</view>
					
					<!-- 搜索框 -->
					<up-input
						v-model="searchKeyword"
						placeholder="搜索收藏地点"
						prefixIcon="search"
						clearable
						@change="handleSearchChange"
					/>
					
					<!-- 地点列表 -->
					<scroll-view scroll-y class="attraction-list">
						<up-cell-group>
						<up-cell
								v-for="item in filteredAttractionList"
								:key="item.uuid"
								:title="item.title"
								:label="item.remark"
								clickable
								@click="handleSelectAttraction(item)"
							>
<template #icon>
									<up-icon name="star-fill" color="#ff9900" size="20"></up-icon>
								</template>
<template #right-icon>
									<view @tap.stop="handleEditAttraction(item)">
										<up-icon name="edit-pen" color="#5DAE60" size="20"></up-icon>
									</view>
								</template>
							</up-cell>
						</up-cell-group>
						<view v-if="filteredAttractionList.length === 0" class="empty-tip">
							<up-icon name="info-circle" size="80" color="#999"></up-icon>
							<text>暂无收藏地点</text>
						</view>
					</scroll-view>
				</view>
			</up-popup>
		</view>
	</my-page-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getTripDetail, createTrip, updateTrip, deleteTrip, getCollectList ,batchGetCollect} from '../../api/api'
import { hasLogin , startNavigation} from '../../utils/tools'
import myPageContainer from '../../components/my-page-container/my-page-container.vue'
import _ from 'lodash';

const formRef = ref(null)
const tripUuid = ref('')
const submitLoading = ref(false)
const deleteLoading = ref(false)

// 收藏点位相关
const attractionPopupShow = ref(false)
const searchKeyword = ref('')
const collectList = ref([])
const collectListLoading = ref(false)

// 日历相关
const calendarShow = ref(false)
const calendarDefaultDate = ref(new Date())

const currentAttractionIndex = ref(0)

const formData = reactive({
	title: '',
	text: '',
	startDate: '',
	endDate: '',
	cover: '',
	routePlan:[]
})

const rules = {
	title: [
		{
			required: true,
			message: '请输入行程名称',
			trigger: ['blur', 'change']
		},
		{
			maxLength: 64,
			message: '行程名称不能超过64个字符',
			trigger: ['blur', 'change']
		}
	],
	cover: [
		{
			maxLength: 255,
			message: '封面图URL不能超过255个字符',
			trigger: ['blur', 'change']
		}
	]
}

const isEditMode = computed(() => !!tripUuid.value)

const dateRangeText = computed(() => {
	if (formData.startDate && formData.endDate) {
		return `${formData.startDate} - ${formData.endDate}`
	}
	return '请选择日期'
})

const filteredAttractionList = computed(() => {
	if (!searchKeyword.value.trim()) {
		return collectList.value
	}
	const keyword = searchKeyword.value.toLowerCase().trim()
	return collectList.value.filter(item => {
		return item.title.toLowerCase().includes(keyword) ||
		       (item.address && item.address.toLowerCase().includes(keyword)) ||
		       (item.remark && item.remark.toLowerCase().includes(keyword))
	})
})

onLoad(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const options = currentPage.options || {}
	tripUuid.value = options.uuid || ''

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
		loadTripDetail()
	}
})

onShow(() => {
	loadCollectList()
})

const loadTripDetail = () => {
	if (!tripUuid.value) return

	uni.showLoading({ title: '加载中...' })
	getTripDetail(tripUuid.value)
		.then((res) => {
			uni.hideLoading()
			if (res.code === 200 && res.data) {
				const data = res.data
				formData.title = data.title || ''
				formData.text = data.text || ''
				formData.startDate = data.startDate || ''
				formData.endDate = data.endDate || ''
				formData.cover = data.cover || ''
				formData.routePlan = data.routePlan || [];
				let uuids = [];
				formData.routePlan.forEach((item)=>{
					if(item.uuid){
						uuids.push(item.uuid)
					}
					_.get(item,"satelliteAttractionList",[]).forEach((item2)=>{
						if(item2.uuid){
							uuids.push(item2.uuid)
						}
					})
				})
				
				if(uuids && uuids.length > 0){
					batchGetCollect({
						uuids:uuids
					}).then((res)=>{
						if(res.code === 200 && res.data){
							formData.routePlan = formData.routePlan.map((item)=>{
								const newSatelliteAttractionList = _.get(item,"satelliteAttractionList",[]).map((item2)=>{
									if(item2.uuid){
										return _.find(res.data,{uuid:item2.uuid}) || item2;
									}
									return item2;
								})

								if (item.uuid) {
									return {
										..._.find(res.data, { uuid: item.uuid }),
										satelliteAttractionList: newSatelliteAttractionList
									}
								}
								
								return item;
							})

						}else{
							uni.showToast({
								title: res.message || '加载收藏点位失败',
								icon: 'none'
							})
						}
					})
				}



				//这里获取到的是这个，需要修改
				
				// [
				//     {
				//         "uuid": "a58b56d9-7a96-4431-aeaf-2d29c86b17b9",
				//         "satelliteAttractionList": [
				//             {
				//                 "uuid": "a58b56d9-7a96-4431-aeaf-2d29c86b17b9"
				//             }
				//         ]
				//     }
				// ]
				
				// formData.routePlan = [
				// 		    {
				// 	        "type":"mainAttraction",
				// 			"id": "9",
				// 			"uuid": "a58b56d9-7a96-4431-aeaf-2d29c86b17b9",
				// 			"userId": "1",
				// 			"title": "余杭区良渚街道黄灯桥",
				// 			"latitude": 30.390115,
				// 			"longitude": 120.047465,
				// 			"address": "水电费水电费s",
				// 			"remark": "在这里停车",
				// 			"isDeleted": 0,
				// 			"createTime": "2026-04-12T12:55:10.206Z",
				// 			"updateTime": "2026-04-12T12:55:10.206Z",
				// 	        "satelliteAttractionList":[
				// 	            {
				// 	                "type":"satelliteAttraction",
				// 	                "id": "9",
				// 	                "uuid": "a58b56d9-7a96-4431-aeaf-2d29c86b17b9",
				// 	                "userId": "1",
				// 	                "title": "天安门",
				// 	                "latitude": 30.390115,
				// 	                "longitude": 120.047465,
				// 	                "address": "水电费水电费s",
				// 	                "remark": "在这里吃烤饼",
				// 	                "isDeleted": 0,
				// 	                "createTime": "2026-04-12T12:55:10.206Z",
				// 	                "updateTime": "2026-04-12T12:55:10.206Z",
				// 	            }
				// 	        ]
				// 	    }
				// ]
				console.log('加载行程详情成功:', data)
			} else {
				uni.showToast({
					title: res.message || '加载行程详情失败',
					icon: 'none'
				})
			}
		})
		.catch((error) => {
			uni.hideLoading()
			console.error('加载行程详情失败:', error)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		})
}

const handleSubmit = async () => {


	try {
		await formRef.value.validate()
	} catch (e) {
		console.log('表单验证失败:', e)
		return
	}

	if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
		uni.showToast({
			title: '结束日期不能早于出发日期',
			icon: 'none'
		})
		return
	}

	submitLoading.value = true

	let routePlan = JSON.parse(JSON.stringify(formData.routePlan));
	routePlan = routePlan.map((item,index)=>{
		let satelliteAttractionList = JSON.parse(JSON.stringify(item?.satelliteAttractionList || []));
		satelliteAttractionList = satelliteAttractionList.map((item2)=>{
			return {
				uuid:item2.uuid
			}
		})
		return {
			uuid:item.uuid,
			satelliteAttractionList:satelliteAttractionList
		}
	})
	console.log(routePlan,123465)
	// return;
	const submitData = {
		title: formData.title,
		text: formData.text || "",
		startDate: formData.startDate || "",
		endDate: formData.endDate || "",
		cover: formData.cover || "",
		routePlan: routePlan
	}

	if (isEditMode.value) {
		updateTrip(tripUuid.value, submitData)
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
				console.error('修改行程失败:', error)
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				})
			})
	} else {
		createTrip(submitData)
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
				console.error('创建行程失败:', error)
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
		content: '确定要删除这个行程吗？删除后无法恢复。',
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
	deleteTrip(tripUuid.value)
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
			console.error('删除行程失败:', error)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		})
}

const handleStartDateClick = () => {
	calendarDefaultDate.value = formData.startDate ? new Date(formData.startDate) : new Date()
	calendarShow.value = true
}


const handleCalendarConfirm = (e) => {
	const selectedDate = e
	if (selectedDate && selectedDate.length > 0) {
		formData.startDate = selectedDate[0]
		formData.endDate = selectedDate[selectedDate.length - 1]
	}
	calendarShow.value = false
}

const addAttractionType = ref("mainAttraction")
const handleAddAttraction = () => {
	attractionPopupShow.value = true
	searchKeyword.value = ''
	//当前选择的是主景点
	addAttractionType.value = "mainAttraction"
	loadCollectList()
}

const handleDeleteAttraction = (index) => {
	const attraction = formData.routePlan[index]
	uni.showModal({
		title: '确认删除',
		content: `是否删除"${attraction.title}"位置？`,
		confirmColor: '#ff4d4f',
		success: (res) => {
			if (res.confirm) {
				formData.routePlan.splice(index, 1)
			}
		}
	})
}

const handleDeleteSatelliteAttraction = (mainIndex, satelliteIndex) => {
	const satellite = formData.routePlan[mainIndex].satelliteAttractionList[satelliteIndex]
	uni.showModal({
		title: '确认删除',
		content: `是否删除"${satellite.title}"卫星景点？`,
		confirmColor: '#ff4d4f',
		success: (res) => {
			if (res.confirm) {
				formData.routePlan[mainIndex].satelliteAttractionList.splice(satelliteIndex, 1)
			}
		}
	})
}


//需要添加的主景点index
const mainAttractionIndex = ref(0)
const handleAddSatelliteAttraction = (index) => {
	attractionPopupShow.value = true
	searchKeyword.value = ''
	//当前选择的是卫星景点
	addAttractionType.value = "satelliteAttraction"
	mainAttractionIndex.value = index
	loadCollectList()
}


const loadCollectList = () => {
	collectListLoading.value = true
	getCollectList()
		.then((res) => {
			collectListLoading.value = false
			if (res.code === 200 && res.data) {
				collectList.value = res.data
			} else {
				uni.showToast({
					title: res.message || '加载收藏地点失败',
					icon: 'none'
				})
			}
		})
		.catch((error) => {
			collectListLoading.value = false
			console.error('加载收藏地点失败:', error)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		})
}

const handleSearchChange = (value) => {
	console.log('搜索关键词:', value)
}

const handleSelectAttraction = (item) => {
	console.log('选择地点:', item)
	uni.showToast({
		title: `已选择：${item.title}`,
		icon: 'success'
	})
	if(addAttractionType.value === "mainAttraction"){
		formData.routePlan.push({
			...item,
			satelliteAttractionList:[]
		})
	}else if(addAttractionType.value === "satelliteAttraction"){
		formData.routePlan[mainAttractionIndex.value].satelliteAttractionList.push({
			...item
		})
	}
	attractionPopupShow.value = false
}

const handleEditAttraction = (item) => {
	uni.navigateTo({
		url: `/pages/PointEditing/PointEditing?uuid=${item.uuid}`
	})
}
</script>

<style lang="scss" scoped>
.trip-details-page {
	min-height: 100vh;
	background: #f5f5f5;
}

.form-container {
	padding: 30rpx;
	background: #ffffff;
	margin-top: 20rpx;
}

.bottom-actions {
	display: flex;
	gap: 20rpx;
	justify-content: space-between;
	
	.up-button {
		flex: 1;
	}
}

.attraction-popup {
	padding: 30rpx;
	max-height: 70vh;
	display: flex;
	flex-direction: column;
}

.popup-title {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 20rpx;
	color: #303133;
}

.attraction-list {
	flex: 1;
	max-height: 50vh;
	margin-top: 20rpx;
}

.empty-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	color: #999;
	font-size: 28rpx;
	gap: 20rpx;
}

.attraction-section {
	display: flex;
	flex-direction: column;

	.attraction-container {
		align-items: center;
	}

	.attraction-item {
		flex: 8;
		display: flex;
		gap: 10px;

		.attraction-content {
			flex: 8;

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
						}
					}

					.attraction-remark {
						flex: 100%;
						color: #888;
						font-size: 24rpx;
					}
				}
			}

			.satellite-container {
				min-height: 100rpx;
				border-left: 2rpx solid #5DAE60;
				margin-left: 30rpx;
				margin: 20rpx 30rpx;
				padding-left: 10rpx;
				display: flex;
				flex-wrap: wrap;

				.satellite-list {
					display: flex;
					margin-bottom: 10px;

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

	.add-attraction-btn {
		flex: 2;
	}
}
</style>
