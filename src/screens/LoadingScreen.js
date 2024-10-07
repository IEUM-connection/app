import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import Test from '../assets/images/loading.png';

const LoadingScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // 애니메이션 값 초기화

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000, // 4초 동안 애니메이션 지속
            easing: Easing.linear, // 애니메이션의 속도를 균등하게 설정
            useNativeDriver: false,
        }).start();
    }, [fadeAnim]);

    return (
        <View style={styles.container}>
            <Animated.Image 
                source={Test} 
                style={[styles.image, { opacity: fadeAnim }]} // 애니메이션 스타일 적용
            />
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