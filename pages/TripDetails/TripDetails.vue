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
				<view>详细内容</view>
				<view>
					<view style="display:flex;align-items: center;">
						<view style="flex: 8;">
							
						</view>
						<view style="flex: 2;"><up-button type="primary" icon="plus" text="添加行程" @click="handleAddAttraction"></up-button></view>
					</view>
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
		</view>
	</my-page-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getTripDetail, createTrip, updateTrip, deleteTrip } from '../../api/api'
import { hasLogin } from '../../utils/tools'
import myPageContainer from '../../components/my-page-container/my-page-container.vue'

const formRef = ref(null)
const tripUuid = ref('')
const submitLoading = ref(false)
const deleteLoading = ref(false)
const tripData = ref([
	    {
        "type":"mainAttraction",
        "uuid":"",
        "satelliteAttractionList":[
            {
                "type":"satelliteAttraction",
                "uuid":""
            }
        ]
    }
])

// 日历相关
const calendarShow = ref(false)
const calendarDefaultDate = ref(new Date())

const formData = reactive({
	title: '',
	text: '',
	startDate: '',
	endDate: '',
	cover: ''
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
			uni.navigateBack()
		}, 1500)
		return
	}

	if (isEditMode.value) {
		loadTripDetail()
	}
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

	const submitData = {
		title: formData.title,
		text: formData.text || "",
		startDate: formData.startDate || "",
		endDate: formData.endDate || "",
		cover: formData.cover || ""
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
</style>
