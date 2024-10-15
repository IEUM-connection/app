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
const INITIAL_POST_DELAY =  1000; // 초기 30분 대기
const POST_INTERVAL = 1000; // 30분마다 데이터 전송
const CHECK_INTERVAL =  1000; // 30초마다 화면 상태 확인
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
        sendSms();
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

        memberInfo = response.data.data;

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

const sendSms = async () => {
    try {

    if (memberInfo) {
        // guardianPhone과 adminPhone이 존재하는지 확인 후 처리
        console.log("회원 정보", memberInfo);
        console.log("보호자 연락처", memberInfo.guardianPhone);
        console.log("관리자 연락처", memberInfo.adminPhone);
        const guardianPh = memberInfo.guardianPhone.replaceAll("-", "") ;
        const adminPh = memberInfo.adminPhone.replaceAll("-", "");
    

    const smsBody =  `${memberInfo.name}님의 핸드폰 미사용시간이 12시간이 되었습니다.\n즉시 연락 바랍니다.\n -이음-`;

    const smsRequest = {
        body : smsBody,
        gudianNum:guardianPh,
        adminNum: adminPh
    }

    const smsData = JSON.stringify(smsRequest);
    console.log("sms 전송 데이터", smsData);


    const smsResponse = await axios.post(`${REACT_APP_API_KEY}/send-sms`,
        smsRequest,
        
    );

    if (smsResponse.status === 200) { // 응답이 성공적인지 확인
        // const responseBody = await response.json();
        // console.log("SMS 전송 성공:", responseBody); // 성공 로그 출력
    } else { // 응답이 실패한 경우
        const errorBody = await smsResponse.text(); // 에러 본문 가져오기
        console.error(`SMS 전송 실패: ${smsResponse.statusText}, 응답 코드: ${smsResponse.status}, 에러 내용: ${errorBody}`); // 실패 로그 출력
    }
    } else {
        console.error("멤버 정보를 가져오는 데 실패했습니다.");
    }
} catch (error) {
    console.error("오류 발생:", error);
   }
}


// 사용 추적 중지 함수
export const stopUsageTracking = () => {
    if (!isTrackingSetup) return;
    isTrackingSetup = false;

    if (Platform.OS === 'android') {
        BackgroundTimer.stopBackgroundTimer();
    }
    console.log('[사용 추적기] 화면 상태 추적이 중지되었습니다.');
};
