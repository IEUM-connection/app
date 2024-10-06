import React, { useState, useEffect } from 'react';
import {
    Platform,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

const TOTAL_DATA_COUNT = 59; // 총 데이터 수
const PAGE_SIZE = 10; // 한 페이지당 아이템 수

const AlarmListScreen = ({ navigation }) => {
    const [listData, setListData] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true); // 더 이상 데이터가 없을 경우를 처리하기 위한 상태

    const fetchData = () => {
        if (isLoading || !hasMoreData) return;

        setIsLoading(true);

        setTimeout(() => {
            const remainingDataCount = TOTAL_DATA_COUNT - listData.length;
            const loadItemCount = remainingDataCount >= PAGE_SIZE ? PAGE_SIZE : remainingDataCount;

            if (loadItemCount > 0) {
                // JSON 형태의 더미 데이터를 직접 생성
                const newData = [
                    { title: '알림 제목 1', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 1' },
                    { title: '알림 제목 2', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 2' },
                    { title: '알림 제목 3', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 3' },
                    { title: '알림 제목 4', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 4' },
                    { title: '알림 제목 5', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 5' },
                    { title: '알림 제목 6', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 6' },
                    { title: '알림 제목 7', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 7' },
                    { title: '알림 제목 8', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 8' },
                    { title: '알림 제목 9', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 9' },
                    { title: '알림 제목 10', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 10' },
                    { title: '알림 제목 11', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 11' },
                    { title: '알림 제목 12', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 12' },
                    { title: '알림 제목 13', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 13' },
                    { title: '알림 제목 14', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 14' },
                    { title: '알림 제목 15', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 15' },
                    { title: '알림 제목 16', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 16' },
                    { title: '알림 제목 17', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 17' },
                    { title: '알림 제목 18', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 18' },
                    { title: '알림 제목 19', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 19' },
                    { title: '알림 제목 20', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 20' },
                    { title: '알림 제목 21', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 21' },
                    { title: '알림 제목 22', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 22' },
                    { title: '알림 제목 23', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 23' },
                    { title: '알림 제목 24', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 24' },
                    { title: '알림 제목 25', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 25' },
                    { title: '알림 제목 26', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 26' },
                    { title: '알림 제목 27', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 27' },
                    { title: '알림 제목 28', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 28' },
                    { title: '알림 제목 29', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 29' },
                    { title: '알림 제목 30', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 30' },
                    { title: '알림 제목 31', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 31' },
                    { title: '알림 제목 32', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 32' },
                    { title: '알림 제목 33', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 33' },
                    { title: '알림 제목 34', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 34' },
                    { title: '알림 제목 35', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 35' },
                    { title: '알림 제목 36', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 36' },
                    { title: '알림 제목 37', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 37' },
                    { title: '알림 제목 38', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 38' },
                    { title: '알림 제목 39', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 39' },
                    { title: '알림 제목 40', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 40' },
                    { title: '알림 제목 41', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 41' },
                    { title: '알림 제목 42', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 42' },
                    { title: '알림 제목 43', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 43' },
                    { title: '알림 제목 44', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 44' },
                    { title: '알림 제목 45', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 45' },
                    { title: '알림 제목 46', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 46' },
                    { title: '알림 제목 47', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 47' },
                    { title: '알림 제목 48', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 48' },
                    { title: '알림 제목 49', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 49' },
                    { title: '알림 제목 50', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 50' },
                    { title: '알림 제목 51', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 51' },
                    { title: '알림 제목 52', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 52' },
                    { title: '알림 제목 53', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 53' },
                    { title: '알림 제목 54', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 54' },
                    { title: '알림 제목 55', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 55' },
                    { title: '알림 제목 56', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 56' },
                    { title: '알림 제목 57', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 57' },
                    { title: '알림 제목 58', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 58' },
                    { title: '알림 제목 59', message: '역삼 2동 담당자님께서 알림을 보내셨습니다 59' },
                ];

                const newPageData = newData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

                // 기존 데이터에 더미 데이터를 추가
                setListData([...listData, ...newPageData]); // 필요한 만큼만 추가
                setPage(page + 1); // 다음 페이지로 설정
            }

            if (listData.length + loadItemCount >= TOTAL_DATA_COUNT) {
                setHasMoreData(false); // 모든 데이터를 로드했으므로 더 이상 데이터를 로드하지 않음
            }

            setIsLoading(false);
        }, 1000); // 1초 후에 데이터를 불러옴
    };

    useEffect(() => {
        fetchData();
    }, []);

    // renderItem 수정: JSON 형식 데이터의 필드를 렌더링
    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.itemText}>{item.title}</Text>
            <Text>{item.message}</Text>
        </View>
    );

    const handleLoadMore = () => {
        if (!isLoading && hasMoreData) {
            fetchData();
        }
    };

    return (
        <View style={styles.container}>
            {/* 알림 내역 상단 부분 */}
            <View style={[styles.alarmHistoryButton, styles.shadowProp]}>
                <View style={styles.alarmHistoryContent}>
                    <Text style={styles.alarmHistoryText}>알림 내역 조회</Text>
                    <SimpleLineIcons name="bell" size={40} color="#F1CA00" />
                </View>
            </View>
            <View style={[styles.test, styles.shadowProp]}>
                {/* 리스트를 감싸는 View */}
                <FlatList
                    data={listData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isLoading ? (
                            <ActivityIndicator size="large" color="#000" />
                        ) : !hasMoreData ? (
                            <Text style={styles.endText}>모든 데이터를 불러왔습니다.</Text>
                        ) : null
                    }
                />

                {/* 닫기 버튼 */}
                <TouchableOpacity onPress={() => navigation.navigate('Main')} style={[styles.closeButton,styles.shadowProp]}>
                    <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#ffffff',
    },
    test: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        padding: 5,
        backgroundColor: '#ffffff',
        width: '90%', // 크기를 명확하게 설정
        height: '75%', // 높이도 설정
        borderRadius: 10,
    },
    shadowProp: {
        ...Platform.select({
            android: {
                elevation: 10, // 그림자 크기 수정
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
        }),
    },
    alarmHistoryButton: {
        backgroundColor: '#fff',
        paddingRight: 30,
        paddingLeft: 30,
        borderRadius: 10,
        width: '86%',
        height: 80,
        alignSelf: 'center',
        marginBottom: 15,
        marginTop: 60,
    },
    alarmHistoryContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },
    alarmHistoryText: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 20,
    },
    item: {
        padding: 15,
        backgroundColor: '#fff',
        marginVertical: 1,
        borderRadius: 10,
        shadowColor: '#000',
        borderBottomWidth: 1, // 구분선 두께
        borderBottomColor: '#ccc', // 구분선 색상
        width: '100%',
        alignSelf: 'center',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    endText: {
        textAlign: 'center',
        padding: 10,
        color: '#888',
    },
    closeButton: {
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        padding: 10,
        width: '50%',
        backgroundColor: '#FCBAAA',
        borderRadius: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default AlarmListScreen;
