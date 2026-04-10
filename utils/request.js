//用uniapp原生发请求
import { getUserInfo } from "./tools.js";

export function http(path, params = {}, method = "POST") {
    const userInfo = getUserInfo();
    const token = userInfo ? userInfo.token : '';
    
    return new Promise((resolve, reject) => {
        uni.request({
            header: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            url: path,
            method,
            data: params,
            async success(res) {
                if (res.statusCode === 200) {
                    resolve(res);
                } else {
                    uni.showToast({
                        title: "网络错误",
                        icon: 'none',
                        duration: 2000
                    })
                    resolve(res);
                }
            },
            fail(err) {
                console.log(err)
                reject(err);
            },
            complete() {
                // uni.hideLoading();    // 在showToast之前执行会受影响
            }
        });
    });
};

