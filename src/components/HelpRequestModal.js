import React, { useState, useEffect } from 'react';

import {View, Text, TouchableOpacity, Modal, StyleSheet, Platform} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { REACT_APP_API_KEY } from '@env';


const HelpRequestModal = ({ visible, onClose }) => {
    
    const [memberInfo, setMemberInfo] = useState();
    const [name, setName] = useState();

    const sendSms = async () => {
        try {

        const credentials = await Keychain.getGenericPassword(); // AccessToken을 가져옵니다.
        if (!credentials) {
            console.error("Access Token이 비어 있습니다. SMS를 보낼 수 없습니다.");
            return;
        }

        const accessToken = credentials.password; // JSON 파싱하지 않고 바로 토큰 사용
        await fetchMemberInfo(accessToken);
        
        if (memberInfo) {
            // guardianPhone과 adminPhone이 존재하는지 확인 후 처리
            console.log("회원 정보", memberInfo);
            console.log("보호자 연락처", memberInfo.guardianPhone);
            console.log("관리자 연락처", memberInfo.adminPhone);
            const guardianPh = memberInfo.guardianPhone.replaceAll("-", "") ;
            const adminPh = memberInfo.adminPhone.replaceAll("-", "");
        

        const smsBody =  `${memberInfo.name}님이 도움을 요청하셨습니다.\n즉시 연락 바랍니다.\n -이음-`;

        const smsRequest = {
            body : smsBody,
            gudianNum:guardianPh,
            adminNum: adminPh
        }

        const smsData = JSON.stringify(smsRequest);
        console.log("sms 전송 데이터", smsData);


        const response = await axios.post(`${REACT_APP_API_KEY}/send-sms`, 
            smsRequest,
            
        );

        if (response.status === 200) { // 응답이 성공적인지 확인
            // const responseBody = await response.json();
            // console.log("SMS 전송 성공:", responseBody); // 성공 로그 출력
        } else { // 응답이 실패한 경우
            const errorBody = await response.text(); // 에러 본문 가져오기
            console.error(`SMS 전송 실패: ${response.statusText}, 응답 코드: ${response.status}, 에러 내용: ${errorBody}`); // 실패 로그 출력
        }
        } else {
            console.error("멤버 정보를 가져오는 데 실패했습니다.");
        }
    } catch (error) {
        console.error("오류 발생:", error);
       }
    }



    const fetchMemberInfo = async (accessToken) => {
        try {
            const memberResponse = await axios.get(`${REACT_APP_API_KEY}/members/member`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}` // Bearer 형식으로 토큰 추가
                }
            });
    
            console.log('memberInfo', memberResponse.data.data);
            setMemberInfo(memberResponse.data.data); // 상태 업데이트
            return memberResponse.data.data; // 멤버 정보 반환
    
        } catch (error) {
            console.error('사용자 정보를 가져오는데 실패했습니다', error);
            return null; // 실패 시 null 반환
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
                    {/* 요청하기 버튼 */}
                    <TouchableOpacity style={[styles.requestButton,styles.shadowProp]} onPress={sendSms}>

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
