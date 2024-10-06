import React from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet, Platform} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const HelpRequestModal = ({ visible, onClose, onRequestHelp }) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={[styles.modalContainer, styles.shadowProp]}>
                    {/* 우측 상단 X 버튼 */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <AntDesign name="close" size={40} color="#909090" />
                    </TouchableOpacity>
                    {/* 모달 내용 */}
                    <Text style={[styles.modalText,{marginTop: 60}]}>도움을 </Text>
                    <Text style={[styles.modalText,{marginBottom: 30}]}>요청하시겠습니까?</Text>
                    {/* 요청하기 버튼 */}
                    <TouchableOpacity style={[styles.requestButton,styles.shadowProp]} onPress={onRequestHelp}>
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
        backgroundColor: 'rgba(228,228,228,0.5)', // 반투명 배경
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        position: 'relative',
        borderWidth: 2,       // 테두리의 두께를 설정합니다.
        borderColor: '#969696',  // 테두리의 색상을 설정합니다.
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
