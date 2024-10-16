import React, { useState, useEffect } from 'react';
import {
    Platform,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import axios from 'axios';
import { REACT_APP_API_KEY } from '@env';
import * as Keychain from 'react-native-keychain';

const PAGE_SIZE = 10; // 한 페이지당 아이템 수

const AlarmListScreen = ({ navigation }) => {
    const [listData, setListData] = useState([]);
    const [page, setPage] = useState(0); // API는 0부터 페이지 시작
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const fetchData = async () => {
        if (isLoading || !hasMoreData) return;

        setIsLoading(true);

        try {
            const credentials = await Keychain.getGenericPassword();
            if (!credentials) {
                console.error('인증 토큰이 없습니다.');
                return;
            }
            const accessToken = credentials.password;

            // 서버에서 데이터 요청
            const response = await axios.get(`${REACT_APP_API_KEY}/alerts/selected-types`, {
                params: {
                    page: page,
                    size: PAGE_SIZE
                },
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            const newData = response.data;
            if (newData.length > 0) {
                setListData([...listData, ...newData]);
                setPage(page + 1);
            } else {
                setHasMoreData(false); // 더 이상 데이터가 없으면 종료
            }
        } catch (error) {
            console.error('알림 목록 가져오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.itemText}>{item.message}</Text>
            <Text style={styles.message}>타입: {item.alertType}</Text>
            <Text style={styles.message}>날짜: {new Date(item.createdAt).toLocaleString()}</Text>
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
                    <Image source={require('../assets/images/bell-yellow.png')} style={styles.bellIcon} />
                </View>
            </View>

            <View style={[styles.test, styles.shadowProp]}>
                {/* 리스트를 감싸는 View */}
                <FlatList
                    data={listData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.alertId.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isLoading ? (
                            <ActivityIndicator size="large" color="#000" />
                        ) : !hasMoreData ? (
                            <Text style={styles.endText}>더 이상 알림이 없습니다.</Text>
                        ) : null
                    }
                />

                {/* 닫기 버튼 */}
                <TouchableOpacity onPress={() => navigation.navigate('Main')} style={[styles.closeButton, styles.shadowProp]}>
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
    bellIcon: {
        width: 32,
        resizeMode: 'contain',
    },
    test: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        padding: 5,
        backgroundColor: '#ffffff',
        width: '86%', // 크기를 명확하게 설정
        height: '80%', // 높이도 설정
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
        height: 70,
        alignSelf: 'center',
        marginBottom: 15,
        marginTop: 50,
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
        fontSize: 22,
    },
    item: {
        padding: 14,
        backgroundColor: '#fff',
        marginVertical: 1,
        borderRadius: 10,
        shadowColor: '#000',
        borderBottomWidth: 1, // 구분선 두께
        borderBottomColor: '#ccc', // 구분선 색상
        width: 300,
        alignSelf: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
    },
    itemText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 5,
    },
    endText: {
        textAlign: 'center',
        padding: 16,
        fontSize: 18,
        color: '#000000',
    },
    closeButton: {
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 22,
        padding: 10,
        backgroundColor: '#FCBAAA',
        borderRadius: 10,
        width: 200,
        height: 50,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default AlarmListScreen;
