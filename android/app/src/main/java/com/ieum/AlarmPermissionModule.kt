package com.meetbti.ieum // 실제 패키지 이름으로 변경하세요

import android.app.AlarmManager
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class AlarmPermissionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AlarmPermissionModule"
    }

    @ReactMethod
    fun checkAlarmPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) { // Android 12 이상
            val alarmManager =
                reactContext.getSystemService(ReactApplicationContext.ALARM_SERVICE) as AlarmManager
            if (alarmManager.canScheduleExactAlarms()) {
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } else {
            promise.resolve(true) // Android 12 미만은 권한 필요 없음
        }
    }

    @ReactMethod
    fun requestAlarmPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
        }
    }
}
