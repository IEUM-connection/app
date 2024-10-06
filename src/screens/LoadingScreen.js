import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Test from '../assets/images/loading.png';

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <Image source={Test} style={styles.image} />
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    image: {
        width: windowWidth * 0.8, // 화면 너비의 80%
        height: windowHeight * 0.3, // 화면 높이의 30%
        resizeMode: 'contain', // 이미지 비율 유지
    },
});

export default LoadingScreen;
