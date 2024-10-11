package com.meetbti.ieum

import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.core.app.NotificationManagerCompat

class GyroSensorService : Service(), SensorEventListener {
    private lateinit var sensorManager: SensorManager
    private lateinit var gyroSensor: Sensor
    private var mediaPlayer: MediaPlayer? = null
    private val handler = Handler()
    internal var alarmActive = false
    private lateinit var stopAlarmReceiver: StopAlarmReceiver

 override fun onCreate() {
    super.onCreate()
    Log.d("GyroSensor", "GyroSensorService 생성됨")
    createNotificationChannel()

    // SensorManager 초기화 및 자이로스코프 센서 등록
     sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        gyroSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE) ?: run {
            Log.e("GyroSensor", "Gyroscope sensor not available!")
            stopSelf()
            return
        }


    sensorManager.registerListener(this, gyroSensor, SensorManager.SENSOR_DELAY_NORMAL)

     // 브로드캐스트 리시버 등록 수정
        stopAlarmReceiver = StopAlarmReceiver()
        val intentFilter = IntentFilter().apply {
            addAction(STOP_ALARM_ACTION)
            addCategory(Intent.CATEGORY_DEFAULT)
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(stopAlarmReceiver, intentFilter, Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(stopAlarmReceiver, intentFilter)
        }
        Log.d("GyroSensor", "StopAlarmReceiver 등록 완료")

        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
    }


     // StopAlarmReceiver 수정
    class StopAlarmReceiver : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            Log.d("StopAlarmReceiver", "onReceive 호출됨: ${intent?.action}")
            when (intent?.action) {
                STOP_ALARM_ACTION -> {
                    Log.d("StopAlarmReceiver", "STOP_ALARM 수신됨")
                    // GyroSensorService의 stopAlarm 메서드를 직접 호출
                    if (context is GyroSensorService) {
                        context.stopAlarm() // 직접 호출
                    }

                    // AlarmActivity 종료를 위한 브로드캐스트 전송
                    val finishIntent = Intent("FINISH_ALARM_ACTIVITY")
                    context?.sendBroadcast(finishIntent)
                }
            }
        }
    }



   private fun createNotification(): Notification {
    // STOP_ALARM 인텐트를 브로드캐스트로
    val stopIntent = Intent(STOP_ALARM_ACTION)
    val stopPendingIntent = PendingIntent.getBroadcast(
        this,
        0,
        stopIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    // 전체 화면 인텐트 설정
    val fullScreenIntent = Intent(this, AlarmActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
    }
    val fullScreenPendingIntent = PendingIntent.getActivity(
        this,
        0,
        fullScreenIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
        .setContentTitle("Gyro Sensor Service")
        .setContentText("Running...")
        .setSmallIcon(R.drawable.ic_stop)
        .addAction(android.R.drawable.ic_lock_idle_alarm, "알람 끄기", stopPendingIntent) // 알람 종료 버튼
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setCategory(NotificationCompat.CATEGORY_ALARM)
        .setFullScreenIntent(fullScreenPendingIntent, true) // 전체 화면 인텐트 설정
        .setOngoing(true) // 알림을 지속적으로 표시
        .build()
}


    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Gyro Sensor Service Channel",
                NotificationManager.IMPORTANCE_HIGH // 높은 중요도로 설정
            ).apply {
                enableVibration(true)
                setSound(null, null)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun triggerAlarm() {
        if (!alarmActive) {
            alarmActive = true
            Log.d("GyroSensor", "알람 시작!")

            // MediaPlayer 설정 및 시작
            if (mediaPlayer == null) {
                try {
                    mediaPlayer = MediaPlayer.create(this, R.raw.alarm_sound)?.apply {
                        isLooping = true
                        start()
                    }
                    Log.d("GyroSensor", "MediaPlayer 시작됨")
                } catch (e: Exception) {
                    Log.e("GyroSensor", "MediaPlayer 에러: ${e.message}")
                }
            } else if (!mediaPlayer!!.isPlaying) {
                mediaPlayer!!.start()
                Log.d("GyroSensor", "MediaPlayer 다시 시작됨")
            }

            // 알람 액티비티 시작
            startAlarmActivity() // 여기에 Activity를 항상 시작하도록 변경

            // 알람이 활성화된 동안 경고 처리
            handler.postDelayed({
                if (alarmActive) {
                    Log.d("GyroSensor", "위험상황 발생. 문자 발송")
                    stopAlarm()
                    sendBroadcast(Intent(STOP_ALARM_ACTION))
                }
            }, 10000)
        } else {
            Log.d("GyroSensor", "알람이 이미 활성화되어 있습니다.")
        }
    }

    // AlarmActivity를 시작하는 메서드
    private fun startAlarmActivity() {
        if (!isAlarmActivityRunning()) {
            val activityIntent = Intent(this, AlarmActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }
            startActivity(activityIntent)
        } else {
            Log.d("GyroSensor", "AlarmActivity가 이미 실행 중입니다.")
        }
    }

    // AlarmActivity가 실행 중인지 확인하는 메서드
    private fun isAlarmActivityRunning(): Boolean {
        val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        for (appTask in activityManager.appTasks) {
            val taskInfo = appTask.taskInfo
            if (taskInfo?.baseActivity?.className == AlarmActivity::class.java.name) {
                return true
            }
        }
        return false
    }

    internal fun stopAlarm() {
        if (alarmActive) {
            alarmActive = false
            Log.d("GyroSensor", "알람 멈춤!")

            mediaPlayer?.apply {
                if (isPlaying) {
                    stop()
                    Log.d("GyroSensor", "MediaPlayer 중지됨") // 추가된 로그
                }
                release()
            }
            mediaPlayer = null

            // 알림 취소
            val notificationManager = NotificationManagerCompat.from(this)
            notificationManager.cancel(NOTIFICATION_ID)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        sensorManager.unregisterListener(this)
        unregisterReceiver(stopAlarmReceiver)
        stopAlarm()
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            val x = it.values[0]
            val y = it.values[1]
            val z = it.values[2]

            // 충격 감지
            if (Math.abs(x) > THRESHOLD || Math.abs(y) > THRESHOLD || Math.abs(z) > THRESHOLD) {
                Log.d("GyroSensor", "충격 감지됨!")
                triggerAlarm()
            }

            // 넘어짐 감지
            if (Math.abs(y) > FALL_THRESHOLD) {
                Log.d("GyroSensor", "넘어짐 감지됨!")
                triggerAlarm()
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    override fun onBind(intent: Intent?): IBinder? = null

   companion object {
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "GYRO_SENSOR_CHANNEL"
        private const val THRESHOLD = 0.1f
        private const val FALL_THRESHOLD = 0.1f
        const val STOP_ALARM_ACTION = "com.meetbti.ieum.action.STOP_ALARM"
    }

}
