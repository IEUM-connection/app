import { Platform, NativeModules } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import axios from 'axios';
import { REACT_APP_API_KEY } from '@env';
import { checkPropTypes } from 'prop-types';
import * as Keychain from 'react-native-keychain';


const { UsageStatsModule } = NativeModules;

let isTrackingSetup = false;
let screenOffStartTime = null;
let lastPostTime = null;
// 처음 30분 동안은 데이터를 전송하지 않습니다.
const INITIAL_POST_DELAY = 30 * 60 * 1000; // 30분을 밀리초로 표현

// 이후 30분마다 데이터를 전송합니다.
const POST_INTERVAL = 30 * 60 * 1000; // 30분을 밀리초로 표현

// 30초마다 화면 상태를 확인합니다.
const CHECK_INTERVAL = 30 * 1000; // 30초를 밀리초로 표현
export const setupUsageTracking = () => {
    if (isTrackingSetup) {
        console.log('[사용 추적기] 추적이 이미 설정되어 있습니다. 건너뜁니다.');
        return;
    }
    isTrackingSetup = true;

    console.log('[사용 추적기] 화면 상태 추적이 시작되었습니다.');
    console.log(REACT_APP_API_KEY)
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
                        if (screenOffStartTime !== null) {
                            // 화면이 다시 켜졌을 때 미사용 시간을 0으로 보냅니다.
                            sendUsageData(0);
                        }
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
    }, CHECK_INTERVAL);
};

const sendUsageData = async (screenOffDuration) => {
    try {
        const credentials = await Keychain.getGenericPassword();
        if (!credentials) {
            console.error('인증 토큰이 없습니다.');
            return;
        }
        const accessToken = credentials.password;

        const response = await axios.patch(`${REACT_APP_API_KEY}/members/phone-inactive`, {
            phoneInactiveTimeMs: screenOffDuration,
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('[사용 추적기] 사용 데이터 전송 성공:', response.data);
    } catch (error) {
        console.error('[사용 추적기] 사용 데이터 전송 실패:', error);
        if (error.response) {
            console.error('응답 데이터:', error.response.data);
            console.error('응답 상태:', error.response.status);
        }
        console.log('[사용 추적기] 사용 데이터:', {
            phoneInactiveTimeMs: screenOffDuration,
        });
    }
};

export const stopUsageTracking = () => {
    if (!isTrackingSetup) return;
    isTrackingSetup = false;

    if (Platform.OS === 'android') {
        BackgroundTimer.stopBackgroundTimer();
    }
    console.log('[사용 추적기] 화면 상태 추적이 중지되었습니다.');
};
