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
import com.meetbti.ieum.TokenPackage

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("MainActivity", "MainActivity onCreate 호출됨")
        // 초기화 작업 수행 (필요한 경우)
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