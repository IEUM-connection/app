package com.choongang.ieum

import android.content.Context
import android.os.PowerManager
import android.app.KeyguardManager
import com.facebook.react.bridge.*

class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var lastCheckTime: Long = System.currentTimeMillis()
    private var nonUsageStartTime: Long = System.currentTimeMillis()

    override fun getName(): String = "UsageStatsModule"

    private fun isScreenOnAndUnlocked(): Boolean {
        val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
        val keyguardManager = reactApplicationContext.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        return powerManager.isInteractive && !keyguardManager.isKeyguardLocked
    }

    @ReactMethod
    fun getUsageStats(promise: Promise) {
        val currentTime = System.currentTimeMillis()
        val isScreenOnAndUnlocked = isScreenOnAndUnlocked()

        if (isScreenOnAndUnlocked) {
            // 화면이 켜져 있고 잠금이 해제된 상태면 사용 중으로 간주
            nonUsageStartTime = currentTime
            promise.resolve(WritableNativeMap().apply {
                putBoolean("isUsing", true)
                putDouble("nonUsageTime", 0.0)
            })
        } else {
            // 화면이 꺼져 있거나 잠금 상태이면 미사용 중으로 간주
            val nonUsageTime = currentTime - nonUsageStartTime
            promise.resolve(WritableNativeMap().apply {
                putBoolean("isUsing", false)
                putDouble("nonUsageTime", nonUsageTime.toDouble())
            })
        }

        lastCheckTime = currentTime
    }
}
