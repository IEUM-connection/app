import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, Alert } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { REACT_APP_API_KEY } from '@env';

const HelpRequestModal = ({ visible, onClose, onRequestHelp }) => {
    const [memberData, setMemberData] = useState(null);

    useEffect(() => {
        fetchMemberData();
    }, []);

    const fetchMemberData = async () => {
        try {
            const credentials = await Keychain.getGenericPassword();
            if (!credentials) {
                console.error('인증 토큰이 없습니다.');
                return;
            }
            const accessToken = credentials.password;

            const response = await axios.get(`${REACT_APP_API_KEY}/members/member`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setMemberData(response.data.data);
        } catch (error) {
            console.error('회원 정보 조회 중 오류:', error);
            Alert.alert('오류', '회원 정보를 불러올 수 없습니다.');
        }
    };

    const handleRequestHelp = async () => {
        if (!memberData || !memberData.adminName) {
            Alert.alert('오류', '관리자 정보를 불러올 수 없습니다.');
            return;
        }

        try {
            const credentials = await Keychain.getGenericPassword();
            if (!credentials) {
                console.error('인증 토큰이 없습니다.');
                return;
            }
            const accessToken = credentials.password;

            const content = `${memberData.memberCode}, ${memberData.name} 님이 도움을 요청했습니다.`;
            const response = await axios.post(`${REACT_APP_API_KEY}/alerts/send-help-alert/{adminName}`, {
                alertType: '도움 요청',
                content: content,
                recipient: '관리자'
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    adminName: memberData.adminName
                }
            });

            if (response.status === 200) {
                Alert.alert('성공', '도움 요청이 전송되었습니다.');
                onRequestHelp();
                onClose();
            } else {
                throw new Error('서버 응답 오류');
            }
        } catch (error) {
            console.error('도움 요청 전송 중 오류:', error);
            Alert.alert('오류', '도움 요청 전송에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={[styles.modalContainer, styles.shadowProp]}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <AntDesign name="close" size={40} color="#909090" />
                    </TouchableOpacity>
                    <Text style={[styles.modalText,{marginTop: 60}]}>도움을 </Text>
                    <Text style={[styles.modalText,{marginBottom: 30}]}>요청하시겠습니까?</Text>
                    <TouchableOpacity style={[styles.requestButton,styles.shadowProp]} onPress={handleRequestHelp}>
                        <Text style={styles.requestButtonText}>요청하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default HelpRequestModal;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(228,228,228,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        position: 'relative',
        borderWidth: 2,
        borderColor: '#969696',
    },
    closeButton: {
        position: 'absolute',
        top: 25,
        right: 25,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 35,
        textAlign: 'center',
        color: '#464646',
        fontWeight: 'bold',
    },
    requestButton: {
        backgroundColor: '#FCBAAA',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 70,
        alignSelf: 'center',
        marginBottom: 60,
    },
    requestButtonText: {
        color: '#fff',
        fontSize: 23,
        fontWeight: 'bold',
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
});
