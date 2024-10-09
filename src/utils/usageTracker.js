import { Platform, NativeModules } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

const { UsageStatsModule } = NativeModules;

let isTrackingSetup = false;

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
                        // console.log(`[사용 추적기] 화면 꺼짐: ${nonUsageTimeInSeconds.toFixed(2)}초`); 주석 처리
                    } else {
                        // console.log('[사용 추적기] 화면 켜짐'); 주석 처리
                    }
                } else {
                    console.log('[사용 추적기] 올바른 데이터를 받지 못했습니다.');
                }
            })
            .catch((error) => {
                console.error('[사용 추적기] 화면 상태 확인 오류:', error);
            });
    }, 1000); // 1초마다 확인
};

export const stopUsageTracking = () => {
    if (!isTrackingSetup) return;
    isTrackingSetup = false;

    if (Platform.OS === 'android') {
        BackgroundTimer.stopBackgroundTimer();
    }
    console.log('[사용 추적기] 화면 상태 추적이 중지되었습니다.');
};
