package com.choongang.ieum

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import android.content.Context
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class GyroSensorService : Service(), SensorEventListener {
    private lateinit var sensorManager: SensorManager
    private lateinit var gyroSensor: Sensor

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager

        // Sensor를 가져올 때 null 체크 및 Non-null assert 사용
        gyroSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE) ?: run {
            Log.e("GyroSensor", "Gyroscope sensor not available!")
            stopSelf() // 서비스 중단
            return
        }

        sensorManager.registerListener(this, gyroSensor, SensorManager.SENSOR_DELAY_NORMAL)

        // Foreground Service로 실행
        startForeground(1, createNotification())
    }

    override fun onSensorChanged(event: SensorEvent?) {
        // 센서 값 처리
        event?.let {
            Log.d("GyroSensor", "센서 값 변화: x=${it.values[0]}, y=${it.values[1]}, z=${it.values[2]}")

            val x = it.values[0]
            val y = it.values[1]
            val z = it.values[2]

            // 센서 값 로그 출력
            Log.d("GyroSensor", "현재 센서 값: x=$x, y=$y, z=$z")

            // 충격 감지 로직
            if (Math.abs(x) > THRESHOLD || Math.abs(y) > THRESHOLD || Math.abs(z) > THRESHOLD) {
                Log.d("GyroSensor", "충격 감지됨!")
                // 여기서 충격 감지 후 필요한 작업 수행
            }

            // 넘어짐 감지 로직
            if (Math.abs(y) > FALL_THRESHOLD) {
                Log.d("GyroSensor", "넘어짐 감지됨!")
                // 여기서 넘어짐 감지 후 필요한 작업 수행
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // 정확도 변경 처리
    }

    override fun onDestroy() {
        super.onDestroy()
        sensorManager.unregisterListener(this)
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, "CHANNEL_ID")
            .setContentTitle("Gyro Sensor Service")
            .setContentText("Running...")
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { // Android 8.0 이상
            val serviceChannel = NotificationChannel(
                "CHANNEL_ID",
                "Gyro Sensor Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    companion object {
        private const val THRESHOLD = 0.1f // 충격 감지 임계값 조정
        private const val FALL_THRESHOLD = 0.1f // 넘어짐 감지 임계값 조정
    }
}
