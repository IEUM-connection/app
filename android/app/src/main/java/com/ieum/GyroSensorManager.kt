package com.ieum

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.util.Log

class GyroSensorManager(context: Context) : SensorEventListener {

    // 센서 매니저 초기화
    private val sensorManager: SensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

    // 자이로스코프 센서 가져오기
    private val gyroSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

    // 충격 감지 시 호출될 콜백 변수 선언
    var onShockDetected: (() -> Unit)? = null
    
    // 넘어짐 감지 시 호출될 콜백 변수 선언
    var onFallDetected: (() -> Unit)? = null

    // 초기화 블록
    init {
        if (gyroSensor != null) {
            sensorManager.registerListener(this, gyroSensor, SensorManager.SENSOR_DELAY_GAME)
            Log.d("GyroSensor", "자이로스코프 센서 등록됨.")
        } else {
            Log.d("GyroSensor", "자이로스코프 센서가 지원되지 않습니다.")
        }
    }

    // 센서 리스너 등록 해제 메서드
    fun unregister() {
        sensorManager.unregisterListener(this)
    }

    // 센서 값이 변경되었을 때 호출되는 메서드
    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            Log.d("GyroSensor", "센서 값 변화: x=${it.values[0]}, y=${it.values[1]}, z=${it.values[2]}")
            
            val x = it.values[0]
            val y = it.values[1]
            val z = it.values[2]

            Log.d("GyroSensor", "현재 센서 값: x=$x, y=$y, z=$z")

            if (Math.abs(x) > THRESHOLD || Math.abs(y) > THRESHOLD || Math.abs(z) > THRESHOLD) {
                Log.d("GyroSensor", "충격 감지됨!") // 로그 추가
                onShockDetected?.invoke() // 충격 감지 콜백 호출
            }

            if (Math.abs(y) > FALL_THRESHOLD) {
                Log.d("GyroSensor", "넘어짐 감지됨!") // 로그 추가
                onFallDetected?.invoke() // 넘어짐 감지 콜백 호출
            }
        }
    }

    // 센서 정확도가 변경되었을 때 호출되는 메서드
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // 정확도 변경 처리
    }

    // 상수 정의를 위한 동반 객체 선언
    companion object {
        private const val THRESHOLD = 0.1f // 충격 감지 임계값 조정
        private const val FALL_THRESHOLD = 0.1f // 넘어짐 감지 임계값 조정
    }
}
