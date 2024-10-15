import axios from 'axios';
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
import * as Keychain from 'react-native-keychain';
import { REACT_APP_API_KEY } from '@env';
import { Linking } from 'react-native'; // Linking 추가


const TOTAL_DATA_COUNT = 11; // 총 데이터 수
const PAGE_SIZE = 10; // 한 페이지당 아이템 수

const NearbyMedicalFacilitiesScreen = ({ navigation }) => {

    const [listData, setListData] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [memberInfo, setMemberInfo] = useState([]);
    const [latitude, setLatitude] = useState();
    const [longitude, setLongitude] = useState();
    

        const fetchMemberInfo = async () => {
            try {
                const credentials = await Keychain.getGenericPassword();
                if (!credentials) {
                    console.error('인증 토큰이 없습니다.');
                    navigation.replace('Login');
                    return;
                }

                const accessToken = credentials.password; // JSON 파싱하지 않고 바로 토큰 사용
                console.log('accessToken', accessToken);

                const memberResponse = await axios.get(`${REACT_APP_API_KEY}/members/member`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}` // Bearer 형식으로 토큰 추가
                    }
                });
                console.log('memberInfo', memberResponse.data);
                setMemberInfo(memberResponse.data);
                setLatitude(memberResponse.data.data.latitude);
                setLongitude(memberResponse.data.data.longitude);
                console.log('latitude:', memberResponse.data.data.latitude);
                console.log('longitude:', memberResponse.data.data.longitude);

            } catch (error) {
                console.error('사용자 정보를 가져오는데 실패했습니다' , error);
                setIsLoading(false);
            }
        };

        const fetchData = async () => {
            if (isLoading || !hasMoreData) return;
    
            setIsLoading(true);
    
            // 사용자 정보를 먼저 가져옵니다.
            await fetchMemberInfo();

            console.log('latitude:', latitude);
            console.log('longitude:', longitude);
            console.log(`Request URL 테스트: ${REACT_APP_API_KEY}/hospital?location=${longitude},${latitude}`);

    
            // 이후 근처 의료 시설 데이터를 가져옵니다.
            try {
                if (latitude && longitude) {
                const response = await axios.get(`${REACT_APP_API_KEY}/hospital?location=${longitude},${latitude}`);

        console.log(`Request URL: ${REACT_APP_API_KEY}/hospital?location=${longitude},${latitude}`);
        console.log('Response Data:', response.data); // 응답 데이터 확인

        // 응답 데이터에서 items 배열을 가져옵니다.
        const newData = response.data.data;

        // newData가 배열인지 확인
        if (Array.isArray(newData)) {
            const newPageData = newData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
            
            setListData([...listData, ...newPageData]);
            setPage(page + 1);
            
            if (listData.length + newPageData.length >= TOTAL_DATA_COUNT) {
                setHasMoreData(false);
            }
        } else {
            console.error('응답 데이터가 배열이 아닙니다.', newData);
        }
        } else {
        }
    } catch (error) {
        console.error('근처 병원 정보를 가져오는데 실패', error);
    } finally {
        setIsLoading(false);
    }
};
    
        useEffect(() => {
            fetchMemberInfo().then(() => {
               fetchData(); 
            })
        }, []);
    
        const renderItem = ({ item }) => {
            const distanceText = item.distance >= 1
                ? `${(item.distance).toFixed(1)}km`
                : `${item.distance * 1000}m`;
    
            return (
                <View style={[
                    styles.item,
                    item.isOpen === 1 ? styles.operatingItem : styles.closedItem
                ]}>
                    <View style={styles.itemContent}>
                        <Text style={styles.itemName}>{item.name}({item.dutyDivName})</Text>
                        <Text style={styles.itemAddress}>{item.dutyAddr}</Text>
                        <Text style={styles.distanceText}>{distanceText}</Text>
                    </View>
                    <View style={[
                        styles.operationStatus,
                        item.isOpen === 1 ? styles.operatingStatus : styles.closedStatus
                    ]}>
                         <TouchableOpacity onPress={() => {
                        const phoneNumber = item.dutyTel1.startsWith('0') ? item.dutyTel1 : `0${item.dutyTel1}`;
                        Linking.openURL(`tel:${phoneNumber}`);
                    }}
                    style={styles.phoneButton} // 버튼 스타일 추가
                >
                    <Text style={styles.operationStatusText}>
                        {item.isOpen === 1 ? '영업중 📞' : '영업종료'}
                    </Text>
                </TouchableOpacity>
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
                        <Text style={styles.headerText}>근처 병원 조회</Text>
                        <SimpleLineIcons name="hospital" size={60} color="#00722E" style={styles.iconStyle} />
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
        width: '86%',
        height: '74%',
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
        height: 70,
        alignSelf: 'center',
        marginBottom: 15,
        marginTop: 50,
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
        fontSize: 22,
        marginBottom: 5,
    },
    iconStyle: {
        marginLeft: 40,
        marginTop: 1,
        alignSelf: 'center',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    itemAddress: {
        fontSize: 16,
        color: '#666',
    },
    distanceText: {
        fontSize: 16,
        color: '#999',
    },
    operationStatus: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        width: 80,  // 고정 너비 추가
        height: 36,
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
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',  // 텍스트 중앙 정렬
        marginBottom: 3,
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
        width: 200,
        height: 50,
        backgroundColor: '#FCBAAA',
        borderRadius: 10,
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
});

export default NearbyMedicalFacilitiesScreen;
