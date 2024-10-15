import { Platform, NativeModules } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import axios from 'axios';
import { REACT_APP_API_KEY } from '@env';
import * as Keychain from 'react-native-keychain';

const { UsageStatsModule } = NativeModules;

// 전역 변수 설정
let isTrackingSetup = false;
let screenOffStartTime = null;
let lastPostTime = null;
let totalScreenOffTime = 0;

// 시간 관련 상수 (밀리초 단위)
const INITIAL_POST_DELAY = 30 * 60 * 1000; // 초기 30분 대기
const POST_INTERVAL = 30 * 60 * 1000; // 30분마다 데이터 전송
const CHECK_INTERVAL = 30 * 1000; // 30초마다 화면 상태 확인
const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 12시간

// 사용 추적 설정 함수
export const setupUsageTracking = () => {
    if (isTrackingSetup) {
        console.log('[사용 추적기] 추적이 이미 설정되어 있습니다. 건너뜁니다.');
        return;
    }
    isTrackingSetup = true;

    console.log('[사용 추적기] 화면 상태 추적이 시작되었습니다.');
    console.log(REACT_APP_API_KEY);
    if (Platform.OS === 'android') {
        startScreenStateTracking();
    }
};

// 화면 상태 추적 시작 함수
const startScreenStateTracking = () => {
    BackgroundTimer.runBackgroundTimer(() => {
        UsageStatsModule.getUsageStats()
            .then((result) => {
                if (result && typeof result === 'object') {
                    if (!result.isUsing) {
                        handleScreenOff(result);
                    } else {
                        handleScreenOn();
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

// 화면 꺼짐 처리 함수
const handleScreenOff = (result) => {
    const currentTime = Date.now();
    const nonUsageTimeInSeconds = result.nonUsageTime / 1000;
    console.log(`[사용 추적기] 화면 꺼짐: ${nonUsageTimeInSeconds.toFixed(2)}초`);

    if (screenOffStartTime === null) {
        screenOffStartTime = currentTime - result.nonUsageTime;
        totalScreenOffTime = result.nonUsageTime;
    } else {
        totalScreenOffTime = currentTime - screenOffStartTime;
    }

    checkTwelveHourMark(currentTime);

    // 데이터 전송 로직
    if (shouldSendData(currentTime)) {
        sendUsageData(totalScreenOffTime);
        lastPostTime = currentTime;
    }
};

// 12시간 경과 체크 함수
const checkTwelveHourMark = (currentTime) => {
    if (Math.abs(totalScreenOffTime - TWELVE_HOURS) < CHECK_INTERVAL / 2) {
        console.log('[사용 추적기] 정확히 12시간 미사용 감지');
        sendUsageData(TWELVE_HOURS, true);
        // 12시간 정확히 도달 후 타이머 리셋
        screenOffStartTime = currentTime;
        totalScreenOffTime = 0;
    }
};

// 데이터 전송 여부 결정 함수
const shouldSendData = (currentTime) => {
    return (lastPostTime === null && totalScreenOffTime >= INITIAL_POST_DELAY) ||
        (lastPostTime !== null && currentTime - lastPostTime >= POST_INTERVAL);
};

// 화면 켜짐 처리 함수
const handleScreenOn = () => {
    console.log('[사용 추적기] 화면 켜짐');
    if (screenOffStartTime !== null) {
        const screenOffDuration = Date.now() - screenOffStartTime;
        sendUsageData(screenOffDuration);
    }
    screenOffStartTime = null;
    totalScreenOffTime = 0;
    lastPostTime = null;
};

// 사용 데이터 전송 함수
const sendUsageData = async (screenOffDuration, isTwelveHourMark = false) => {
    try {
        const credentials = await Keychain.getGenericPassword();
        if (!credentials) {
            console.error('인증 토큰이 없습니다.');
            return;
        }
        const accessToken = credentials.password;

        const response = await axios.patch(`${REACT_APP_API_KEY}/members/phone-inactive`, {
            phoneInactiveTimeMs: screenOffDuration,
            isTwelveHourMark: isTwelveHourMark
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log(`[사용 추적기] 사용 데이터 전송 성공 ${isTwelveHourMark ? '(정확히 12시간 미사용)' : ''}:`, response.data);
    } catch (error) {
        console.error('[사용 추적기] 사용 데이터 전송 실패:', error);
        if (error.response) {
            console.error('응답 데이터:', error.response.data);
            console.error('응답 상태:', error.response.status);
        }
        console.log('[사용 추적기] 사용 데이터:', {
            phoneInactiveTimeMs: screenOffDuration,
            isTwelveHourMark: isTwelveHourMark
        });
    }
};

// 사용 추적 중지 함수
export const stopUsageTracking = () => {
    if (!isTrackingSetup) return;
    isTrackingSetup = false;

    if (Platform.OS === 'android') {
        BackgroundTimer.stopBackgroundTimer();
    }
    console.log('[사용 추적기] 화면 상태 추적이 중지되었습니다.');
};
