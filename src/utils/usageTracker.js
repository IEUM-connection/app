import { Platform, NativeModules } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import axios from 'axios';
import { REACT_APP_API_KEY } from '@env';

const { UsageStatsModule } = NativeModules;

let isTrackingSetup = false;
let screenOffStartTime = null;
let lastPostTime = null;
const INITIAL_POST_DELAY = 10000; // 30분을 밀리초로 표현 (처음 30분은 데이터 전송하지 않음)
const POST_INTERVAL = 1000 ; // 30분을 밀리초로 표현   (이후 30분마다 데이터 전송)
const API_URL = `${REACT_APP_API_KEY}/members`; // POST 요청을 보낼 API 엔드포인트

export const setupUsageTracking = () => {
    if (isTrackingSetup) {
        console.log('[사용 추적기] 추적이 이미 설정되어 있습니다. 건너뜁니다.');
        return;
    }
    isTrackingSetup = true;

    console.log('[사용 추적기] 화면 상태 추적이 시작되었습니다.');
    if (Platform.OS === 'android') {
        startScreenStateTracking();
    }
};

const startScreenStateTracking = () => {
    BackgroundTimer.runBackgroundTimer(() => {
        UsageStatsModule.getUsageStats()
            .then((result) => {
                if (result && typeof result === 'object') {
                    if (!result.isUsing) {
                        const nonUsageTimeInSeconds = result.nonUsageTime / 1000;
                        console.log(`[사용 추적기] 화면 꺼짐: ${nonUsageTimeInSeconds.toFixed(2)}초`);

                        if (screenOffStartTime === null) {
                            screenOffStartTime = Date.now() - result.nonUsageTime;
                        }

                        const currentTime = Date.now();
                        const screenOffDuration = currentTime - screenOffStartTime;

                        if (screenOffDuration >= INITIAL_POST_DELAY && lastPostTime === null) {
                            // 처음 30분 경과 시 데이터 전송
                            sendUsageData(screenOffDuration);
                            lastPostTime = currentTime;
                        } else if (lastPostTime !== null && currentTime - lastPostTime >= POST_INTERVAL) {
                            // 이후 30분 간격으로 데이터 전송
                            sendUsageData(screenOffDuration);
                            lastPostTime = currentTime;
                        }
                    } else {
                        console.log('[사용 추적기] 화면 켜짐');
                        screenOffStartTime = null;
                        lastPostTime = null;
                    }
                } else {
                    console.log('[사용 추적기] 올바른 데이터를 받지 못했습니다.');
                }
            })
            .catch((error) => {
                console.error('[사용 추적기] 화면 상태 확인 오류:', error);
            });
    }, 10000); // 30초마다 확인
};

const sendUsageData = (screenOffDuration) => {
    // Assuming you have the JWT token stored in a variable or can retrieve it
    const jwtToken = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6Ik1FTUJFUiIsInVzZXJuYW1lIjoiTUVNMDA0Iiwic3ViIjoiTUVNMDA0IiwiaWF0IjoxNzI4NTM5NDg3LCJleHAiOjE3Mjg1NDMwODd9.yO3q1gWbwtlZufkLPtzVfdXRdxFpmkyvBXUZaltrO34';
    axios.patch(API_URL, {
        phoneInactiveDuration: screenOffDuration,
        // timestamp: new Date().toISOString()
    }, {
        headers: {
            'Authorization':jwtToken,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('[사용 추적기] 사용 데이터 전송 성공:', response.data);
        })
        .catch(error => {
            console.error('[사용 추적기] 사용 데이터 전송 실패:', error);
            console.log(API_URL);
            console.log('[사용 추적기] 사용 데이터:', {
                phoneInactiveDuration: screenOffDuration,
                // timestamp: new Date().toISOString()
            });
        });
};

export const stopUsageTracking = () => {
    if (!isTrackingSetup) return;
    isTrackingSetup = false;

    if (Platform.OS === 'android') {
        BackgroundTimer.stopBackgroundTimer();
    }
    console.log('[사용 추적기] 화면 상태 추적이 중지되었습니다.');
};
