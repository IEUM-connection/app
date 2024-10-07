package com.ieum

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

// MainActivity 클래스 선언. ReactActivity를 상속받음
class MainActivity : ReactActivity() {

    // gyroSensorManager 변수 선언
    private lateinit var gyroSensorManager: GyroSensorManager

    // 액티비티가 처음 생성될 때 호출되는 메서드
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        checkPermissions() // 권한 체크 및 요청

        // gyroSensorManager 초기화
        gyroSensorManager = GyroSensorManager(this).apply {
            onShockDetected = {
                Log.d("GyroSensor", "충격 감지됨!")
            }
            onFallDetected = {
                Log.d("GyroSensor", "넘어짐 감지됨!")
            }
        }
    }

    // 권한 요청 메서드
    private fun checkPermissions() {
        val bodySensorsPermissionCheck = ContextCompat.checkSelfPermission(this, Manifest.permission.BODY_SENSORS)
        val activityRecognitionPermissionCheck = ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION)

        val permissionsNeeded = mutableListOf<String>()

        if (bodySensorsPermissionCheck != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.BODY_SENSORS)
        }

        if (activityRecognitionPermissionCheck != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACTIVITY_RECOGNITION)
        }

        if (permissionsNeeded.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toTypedArray(), 1)
        }
    }

    // 권한 요청 결과 처리
        override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 1) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("Permission", "센서 권한이 승인되었습니다.")
            } else {
                Log.d("Permission", "센서 권한이 거부되었습니다.")
            }
        }
    }


    // 액티비티가 일시 정지될 때 호출되는 메서드
    override fun onPause() {
        super.onPause()
        gyroSensorManager.unregister()
    }

    // 메인 컴포넌트의 이름을 반환하는 메서드
    override fun getMainComponentName(): String = "ieum"

    // React Native 액티비티의 설정을 정의하는 메서드
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
