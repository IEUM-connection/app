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
import SimpleLineIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TOTAL_DATA_COUNT = 11; // 총 데이터 수
const PAGE_SIZE = 10; // 한 페이지당 아이템 수

const NearbyMedicalFacilitiesScreen = ({ navigation }) => {
    const [listData, setListData] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const fetchData = () => {
        if (isLoading || !hasMoreData) return;

        setIsLoading(true);

        setTimeout(() => {
            const remainingDataCount = TOTAL_DATA_COUNT - listData.length;
            const loadItemCount = remainingDataCount >= PAGE_SIZE ? PAGE_SIZE : remainingDataCount;

            if (loadItemCount > 0) {
                // 수정된 JSON 형태의 더미 데이터 (11개)
                const newData = [
                    { name: "역삼 종은병원", address: "테헤란로 7길 7", distance: 512, isOperating: true },
                    { name: "역삼 럭키병원", address: "테헤란로 7길 54", distance: 1000, isOperating: true },
                    { name: "강남 제일병원", address: "테헤란로 8길 12", distance: 1500, isOperating: true },
                    { name: "강남역 참사랑병원", address: "생각대로 132", distance: 2300, isOperating: false },
                    { name: "성모병원 신논현", address: "압구정동 219", distance: 3100, isOperating: false },
                    { name: "오은영 약국", address: "금쪽이로 1050", distance: 3300, isOperating: true },
                    { name: "강남 세브란스병원", address: "언주로 211", distance: 2800, isOperating: true },
                    { name: "365열린약국", address: "강남대로 390", distance: 750, isOperating: true },
                    { name: "미래약국", address: "테헤란로 152", distance: 1200, isOperating: false },
                    { name: "연세사랑병원", address: "봉은사로 118", distance: 1800, isOperating: true },
                    { name: "굿모닝 약국", address: "삼성로 212", distance: 2500, isOperating: false },
                ];

                const newPageData = newData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

                setListData([...listData, ...newPageData]);
                setPage(page + 1);
            }

            if (listData.length + loadItemCount >= TOTAL_DATA_COUNT) {
                setHasMoreData(false);
            }

            setIsLoading(false);
        }, 1000);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderItem = ({ item }) => {
        const distanceText = item.distance >= 1000
            ? `${(item.distance / 1000).toFixed(1)}km`
            : `${item.distance}m`;

        return (
            <View style={[
                styles.item,
                item.isOperating ? styles.operatingItem : styles.closedItem
            ]}>
                <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemAddress}>{item.address}</Text>
                    <Text style={styles.distanceText}>{distanceText}</Text>
                </View>
                <View style={[
                    styles.operationStatus,
                    item.isOperating ? styles.operatingStatus : styles.closedStatus
                ]}>
                    <Text style={styles.operationStatusText}>
                        {item.isOperating ? '영업중' : '영업종료'}
                    </Text>
                </View>
            </View>
        );
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMoreData) {
            fetchData();
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, styles.shadowProp]}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerText}>근처 병원 / 약국 조회</Text>
                    <SimpleLineIcons name="hospital" size={40} color="#00722E" />
                </View>
            </View>
            <View style={[styles.listContainer, styles.shadowProp]}>
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
    listContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        padding: 5,
        backgroundColor: '#ffffff',
        width: '90%',
        height: '75%',
        borderRadius: 10,
    },
    shadowProp: {
        ...Platform.select({
            android: {
                elevation: 5,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
        }),
    },
    header: {
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
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },
    headerText: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        marginVertical: 4,
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: '100%',
        alignSelf: 'center',
    },
    operatingItem: {
        borderLeftWidth: 5,
        borderLeftColor: '#FCBAAA',
    },
    closedItem: {
        borderLeftWidth: 5,
        borderLeftColor: '#808080',
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    itemAddress: {
        fontSize: 14,
        color: '#666',
    },
    distanceText: {
        fontSize: 14,
        color: '#999',
    },
    operationStatus: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        width: 70,  // 고정 너비 추가
        alignItems: 'center',  // 내부 콘텐츠 중앙 정렬
        justifyContent: 'center',  // 내부 콘텐츠 중앙 정렬
    },
    operatingStatus: {
        backgroundColor: '#FCBAAA',
    },
    closedStatus: {
        backgroundColor: '#808080',
    },
    operationStatusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',  // 텍스트 중앙 정렬
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
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default NearbyMedicalFacilitiesScreen;
