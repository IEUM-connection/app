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

        // GyroSensorService 시작
        Intent(this, GyroSensorService::class.java).also { intent ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent)
            } else {
                startService(intent)
            }
        }

        // 배터리 최적화 비활성화
        disableBatteryOptimization()

        // 권한 체크 및 요청
        checkPermissions()
    }

    private fun checkPermissions() {
        val permissionsNeeded = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.BODY_SENSORS) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.BODY_SENSORS)
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACTIVITY_RECOGNITION)
        }

        // Android 13 이상에서 POST_NOTIFICATIONS 권한 추가 요청
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissionsNeeded.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toTypedArray(), 1)
        }
    }

    // 권한 요청 결과 처리
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 1) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                Log.d("Permission", "필요한 모든 권한이 승인되었습니다.")
            } else {
                Log.d("Permission", "필요한 권한 중 일부가 거부되었습니다.")
                Toast.makeText(this, "필요한 권한이 승인되지 않았습니다.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // 배터리 최적화를 비활성화하는 메서드
    private fun disableBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent()
            val packageName = applicationContext.packageName
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                intent.action = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                intent.data = Uri.parse("package:$packageName")
                startActivity(intent)
            }
        }
    }

    // 메인 컴포넌트의 이름을 반환하는 메서드
    override fun getMainComponentName(): String = "ieum"

    // React Native 액티비티의 설정을 정의하는 메서드
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
