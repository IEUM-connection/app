package com.meetbti.ieum

import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
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
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Callback
import okhttp3.Call
import okhttp3.Response
import com.google.gson.Gson

class GyroSensorService : Service(), SensorEventListener {
    private lateinit var sensorManager: SensorManager
    private lateinit var gyroSensor: Sensor
    private var mediaPlayer: MediaPlayer? = null
    private val handler = Handler()
    internal var alarmActive = false
    private lateinit var stopAlarmReceiver: StopAlarmReceiver
    data class MemberInfo(val name: String, val tel: String, val emergencyContact: String)


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
            GyroSensorService.STOP_ALARM_ACTION -> {
                val manual = intent.getBooleanExtra("manual", false)  // manual 값을 인텐트에서 가져옴
                Log.d("StopAlarmReceiver", "STOP_ALARM 수신됨, manual: $manual")
                
                if (context is GyroSensorService) {
                    context.stopAlarm(manual)  // manual 값 전달하여 stopAlarm 호출
                }

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

           // 10초 뒤에 알람 자동 종료
           handler.postDelayed({
            if (alarmActive) {
                stopAlarm(manual = false) // 자동으로 꺼짐
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

    internal fun stopAlarm(manual: Boolean = false) { // 기본값을 false로 설정
    if (alarmActive) {
        alarmActive = false
        Log.d("GyroSensor", "알람 멈춤!")

        mediaPlayer?.apply {
            if (isPlaying) {
                stop()
                Log.d("GyroSensor", "MediaPlayer 중지됨")
            }
            release()
        }
        mediaPlayer = null

        // 알림 취소
        val notificationManager = NotificationManagerCompat.from(this)
        notificationManager.cancel(NOTIFICATION_ID)

        // 로그 추가
        if (manual) {
            Log.d("GyroSensor", "안전한 상황입니다.") // 수동으로 꺼진 경우
        } else {
           CoroutineScope(Dispatchers.IO).launch {
               sendSms()
           }
            Log.d("GyroSensor", "응급상황 발생! 알람이 자동으로 꺼졌습니다.") // 자동으로 꺼진 경우
        }
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
        private const val THRESHOLD = 100f
        private const val FALL_THRESHOLD =100f
        const val STOP_ALARM_ACTION = "com.ieum.action.STOP_ALARM"
    }

  private fun sendSms() {
    CoroutineScope(Dispatchers.IO).launch {
        val accessToken = getAccessToken() // 액세스 토큰 가져오기
        val memberInfo = fetchMemberInfo(accessToken) // 멤버 정보 가져오기

        // 멤버 정보를 성공적으로 가져온 경우
        if (memberInfo != null) {
            val fromNumber = memberInfo.emergencyContact // 멤버의 전화번호
            val smsBody = "${memberInfo.name}님의 핸드폰에서 충격이 감지되었습니다. 즉시 확인 바랍니다. -이음-" // SMS 본문 작성

            // SMS 전송 데이터 생성
            val smsData = """
                {
                    "body": "$smsBody",
                    "to": "$fromNumber",
                    "from": "$fromNumber"
                }
            """.trimIndent() // SMS 전송에 필요한 데이터 JSON 형식으로 문자열로 구성

            val client = OkHttpClient() // OkHttpClient 인스턴스 생성
            val requestBody = smsData.toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull()) // 요청 본문을 JSON 형식으로 변환
            val request = Request.Builder()
                .url("http://172.30.1.99:8080/send-sms") // SMS 전송을 위한 서버 URL 설정
                .post(requestBody) // POST 방식으로 요청 본문 설정
                .addHeader("Authorization", "Bearer $accessToken") // 인증 헤더 추가
                .build() // 요청 객체 빌드

            client.newCall(request).enqueue(object : Callback { // 비동기 요청 실행
                override fun onFailure(call: Call, e: IOException) { // 요청 실패 시 호출되는 콜백
                    Log.e("GyroSensor", "SMS 전송 실패: ${e.message}") // 오류 메시지 로그 출력
                }

                override fun onResponse(call: Call, response: Response) { // 요청 성공 시 호출되는 콜백
                    if (response.isSuccessful) { // 응답이 성공적인지 확인
                        Log.d("GyroSensor", "SMS 전송 성공: ${response.body?.string()}") // 성공 로그 출력
                    } else { // 응답이 실패한 경우
                        Log.e("GyroSensor", "SMS 전송 실패: ${response.message}") // 실패 로그 출력
                    }
                }
            })
        } else {
            Log.e("GyroSensor", "멤버 정보를 가져오는 데 실패했습니다.")
        }
    }
}


// 멤버 정보를 가져오는 함수 정의
private suspend fun fetchMemberInfo(accessToken: String): MemberInfo? {
    return try {
        val client = OkHttpClient() // OkHttpClient 인스턴스 생성
        val request = Request.Builder()
            .url("http://172.30.1.99:8080/members/member") // API URL
            .addHeader("Authorization", "Bearer $accessToken") // Bearer 형식으로 토큰 추가
            .build() // 요청 객체 빌드

        val response = client.newCall(request).execute() // 동기 요청 실행
        if (response.isSuccessful) {
            // 응답을 JSON으로 파싱하여 MemberInfo 객체로 변환
            val responseData = response.body?.string()
            // JSON 파싱 (예: Gson 사용)
            val memberInfo = parseMemberInfo(responseData)
            memberInfo
        } else {
            Log.e("GyroSensor", "멤버 정보를 가져오는 중 오류 발생: ${response.message}")
            null
        }
    } catch (e: Exception) {
        Log.e("GyroSensor", "멤버 정보를 가져오는 중 오류 발생: ${e.message}")
        null
    }
}

// JSON 파싱을 위한 함수 정의 (Gson 라이브러리 사용 예시)
private fun parseMemberInfo(jsonData: String?): MemberInfo? {
    // JSON 파싱 로직 여기에 추가 (예: Gson 사용)
    // Gson을 사용하여 MemberInfo 객체로 변환하는 예시
    return Gson().fromJson(jsonData, MemberInfo::class.java)
}


  private fun getAccessToken(): String { // Access Token을 가져오는 함수 정의
        try {
            // MasterKey 생성
            val masterKey = MasterKey.Builder(this)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            // EncryptedSharedPreferences 생성 (TokenModule과 동일한 PREFS_NAME 사용)
            val sharedPreferences = EncryptedSharedPreferences.create(
                this,
                "encrypted_token_prefs", // TokenModule에서 사용한 PREFS_NAME과 동일해야 함
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )

            // Access Token 불러오기
            val token = sharedPreferences.getString("access_token", "")
            if (token.isNullOrEmpty()) {
                Log.e("GyroSensor", "Access Token을 찾을 수 없습니다.")
                // 필요 시 토큰이 없을 때의 처리 로직 추가 (예: 알림 보내기)
                return ""
            }
            return token
        } catch (e: Exception) {
            Log.e("GyroSensor", "Access Token 가져오기 실패: ${e.message}")
            return ""
        }
    }
}
