package com.meetbti.ieum

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.content.Context
import android.os.PowerManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import android.provider.Settings
import android.net.Uri
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("MainActivity", "MainActivity onCreate 호출됨")

        // 권한 체크 및 요청을 onCreate에서 호출
        checkPermissions()
    }

    // onResume()에서 권한 체크 함수 호출 제거
    // override fun onResume() {
    //     super.onResume()
    //     Log.d("MainActivity", "MainActivity onResume 호출됨")
    //     // 권한 체크 및 요청 제거
    //     // checkPermissions()
    // }

    private fun checkPermissions() {
        Log.d("PermissionCheck", "권한 체크 시작")
        val permissionsNeeded = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.BODY_SENSORS) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.BODY_SENSORS)
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACTIVITY_RECOGNITION)
        }

        // POST_NOTIFICATIONS 권한 요청 제거
        // if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        //     if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
        //         permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS)
        //     }
        // }

        if (permissionsNeeded.isNotEmpty()) {
            Log.d("PermissionCheck", "권한 요청 필요: $permissionsNeeded")
            ActivityCompat.requestPermissions(this, permissionsNeeded.toTypedArray(), 1)
        } else {
            Log.d("PermissionCheck", "모든 권한이 이미 승인됨")
            // 모든 권한이 승인됨, 서비스 시작
            startGyroSensorService()
        }
    }

    // 권한 요청 결과 처리
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        Log.d("PermissionCheck", "권한 요청 결과 처리 중: requestCode=$requestCode")
        if (requestCode == 1) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                Log.d("Permission", "필요한 모든 권한이 승인되었습니다.")
                // 모든 권한이 승인됨, 서비스 시작
                startGyroSensorService()
            } else {
                Log.d("Permission", "필요한 권한 중 일부가 거부되었습니다.")
                Toast.makeText(this, "필요한 권한이 승인되지 않았습니다.", Toast.LENGTH_SHORT).show()
            }
        }

    }

    // GyroSensorService 시작
    private fun startGyroSensorService() {
        Log.d("Service", "GyroSensorService 시작")
        Intent(this, GyroSensorService::class.java).also { intent ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent)
            } else {
                startService(intent)
            }
        }

        // 배터리 최적화 비활성화
        disableBatteryOptimization()
    }

    // 배터리 최적화를 비활성화하는 메서드
    private fun disableBatteryOptimization() {
        Log.d("BatteryOptimization", "배터리 최적화 비활성화 시도")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent()
            val packageName = applicationContext.packageName
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                intent.action = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                intent.data = Uri.parse("package:$packageName")
                startActivity(intent)
            } else {
                Log.d("BatteryOptimization", "이미 배터리 최적화가 비활성화됨")
            }
        }
    }

    // 메인 컴포넌트의 이름을 반환하는 메서드
    override fun getMainComponentName(): String = "ieum"

    // React Native 액티비티의 설정을 정의하는 메서드
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}