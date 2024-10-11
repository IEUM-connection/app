package com.ieum

import android.app.Activity
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.content.Context
import android.view.WindowManager
import android.Manifest
import android.widget.Button
import android.widget.TextView
import android.app.KeyguardManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager

class AlarmActivity : Activity() {

    private val REQUEST_CODE_PERMISSIONS = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("AlarmActivity", "onCreate 호출됨")

        // 화면이 꺼진 상태에서도 알람 UI가 보이도록 설정
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.requestDismissKeyguard(this, null)
        } else {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }

        setContentView(R.layout.activity_alarm)

        val textView: TextView = findViewById(R.id.alarmText)
        val stopButton: Button = findViewById(R.id.stopButton)
        stopButton.setOnClickListener {
            Log.d("AlarmActivity", "스톱 버튼 클릭됨")
            val stopIntent = Intent(GyroSensorService.STOP_ALARM_ACTION).apply {
                setPackage(packageName)  // 명시적으로 패키지 지정
                addCategory(Intent.CATEGORY_DEFAULT)
            }
            Log.d("AlarmActivity", "STOP_ALARM 인텐트 생성됨: ${stopIntent.action}")
            sendBroadcast(stopIntent)
            Log.d("AlarmActivity", "STOP_ALARM 브로드캐스트 전송됨")

            finish()
        }
    }

    override fun onStart() {
        super.onStart()
        Log.d("AlarmActivity", "onStart 호출됨")
        // 권한 요청
        requestPermissions() 
    }

    private fun requestPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQUEST_CODE_PERMISSIONS)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if ((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                Log.d("AlarmActivity", "권한 승인됨")
            } else {
                Log.d("AlarmActivity", "권한 거부됨")
            }
        }
    }

    override fun onResume() {
        super.onResume()
        Log.d("AlarmActivity", "onResume 호출됨")
    }

    override fun onPause() {
        super.onPause()
        Log.d("AlarmActivity", "onPause 호출됨")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d("AlarmActivity", "onDestroy 호출됨")
    }
}

