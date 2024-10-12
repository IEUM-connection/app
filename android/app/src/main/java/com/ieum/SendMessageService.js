// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const SendMessage = () => {
//     const [fromNumber, setFromNumber] = useState('');

//     // 컴포넌트가 마운트될 때 guardianContact 가져오기
//     useEffect(() => {
//         const fetchGuardianContact = async () => {
//             try {
//                 const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//                     },
//                 });
//                 const guardianContact = response.data.guardianContact; // 데이터 구조에 따라 수정 필요
//                 setFromNumber(guardianContact);
//                 await sendSms(); // SMS 전송
//             } catch (error) {
//                 console.error('연락처 가져오기 실패:', error);
//             }
//         };

//         fetchGuardianContact();
//     }, []); // 빈 배열로 첫 렌더링 시 한 번만 호출

//     const sendSms = async () => {
//         const smsBody = "ㅇㅇㅇ님의 핸드폰에서 충격이 감지되었습니다. 즉시 확인 바랍니다.  -이음-";
//         const toNumber = "01095378294"; // 수신자 전화번호 입력

//         const smsData = {
//             body: smsBody,
//             to: toNumber,
//             from: fromNumber,
//         };

//         try {
//             const response = await axios.post(`${process.env.REACT_APP_API_URL}/send-sms`, smsData, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//                 },
//             });
//             console.log('문자 전송 성공:', response.data);
//             showNotification("보호자에게 문자가 전송되었습니다."); // 푸시 알림 표시
//         } catch (error) {
//             console.error('문자 전송 실패:', error);
//         }
//     };

//     const showNotification = (message) => {
//         // 알림 권한 요청
//         if (window.Notification.permission === "granted") {
//             new window.Notification(message);
//         } else if (window.Notification.permission !== "denied") {
//             window.Notification.requestPermission().then((permission) => {
//                 if (permission === "granted") {
//                     new window.Notification(message);
//                 }
//             });
//         }
//     };

//     return null; // 아무것도 렌더링하지 않음
// };

// export default SendMessage;
