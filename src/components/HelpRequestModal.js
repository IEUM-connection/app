import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { REACT_APP_API_KEY } from '@env';

const HelpRequestModal = ({ visible, onClose }) => {
    const [isRequestSent, setIsRequestSent] = useState(false);

    const sendSms = async () => {
        try {
            const credentials = await Keychain.getGenericPassword();
            if (!credentials) {
                console.error("Access Token이 비어 있습니다. SMS를 보낼 수 없습니다.");
                return;
            }

            const accessToken = credentials.password;
            const memberData = await fetchMemberInfo(accessToken);

            if (memberData) {
                const guardianPh = memberData.guardianPhone.replaceAll("-", "");
                const adminPh = memberData.adminPhone.replaceAll("-", "");

                const smsBody = `${memberData.name}님이 도움을 요청하셨습니다.\n즉시 연락 바랍니다.\n -이음-`;

                const smsRequest = {
                    body: smsBody,
                    gudianNum: guardianPh,
                    adminNum: adminPh
                };

                const response = await axios.post(`${REACT_APP_API_KEY}/send-sms`, smsRequest);

                if (response.status === 200) {
                    setIsRequestSent(true); // 요청 성공 시 상태 변경
                } else {
                    const errorBody = await response.text();
                    console.error(`SMS 전송 실패: ${response.statusText}, 응답 코드: ${response.status}, 에러 내용: ${errorBody}`);
                }
            } else {
                console.error("멤버 정보를 가져오는 데 실패했습니다.");
            }
        } catch (error) {
            console.error("오류 발생:", error);
        }
    };

    const fetchMemberInfo = async (accessToken) => {
        try {
            const memberResponse = await axios.get(`${REACT_APP_API_KEY}/members/member`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return memberResponse.data.data;
        } catch (error) {
            console.error('사용자 정보를 가져오는데 실패했습니다', error);
            return null;
        }
    };

    const handleClose = () => {
        setIsRequestSent(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalBackground}>
                <View style={[styles.modalContainer, styles.shadowProp]}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <AntDesign name="close" size={40} color="#909090" />
                    </TouchableOpacity>
                    <View style={styles.contentWrapper}>
                        {isRequestSent ? (
                            <Text style={[styles.modalText, { marginTop: 10 }]}>도움이 요청되었습니다</Text>
                        ) : (
                            <>
                                <Text style={[styles.modalText, { marginTop: 60 }]}>도움을</Text>
                                <Text style={[styles.modalText, { marginBottom: 30 }]}>요청하시겠습니까?</Text>
                                <TouchableOpacity style={[styles.requestButton, styles.shadowProp]} onPress={sendSms}>
                                    <Text style={styles.requestButtonText}>요청하기</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
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
    contentWrapper: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 300, // 모달 내용 크기를 고정해서 버튼과 텍스트 배치가 동일하게 유지되도록 설정
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
        height: 70, // 기존 버튼 크기 유지
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
