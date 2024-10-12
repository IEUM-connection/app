package com.meetbti.ieum

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class TokenModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val PREFS_NAME = "encrypted_token_prefs"
    private val TOKEN_KEY = "access_token"

    override fun getName(): String {
        return "TokenModule"
    }

    /**
     * Access Token을 EncryptedSharedPreferences에 저장하는 메서드
     * @param token 저장할 Access Token
     */
    @ReactMethod
    fun saveAccessToken(token: String, promise: Promise) {
        try {
            val masterKey = MasterKey.Builder(reactApplicationContext)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            val sharedPreferences = EncryptedSharedPreferences.create(
                reactApplicationContext,
                PREFS_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )

            with(sharedPreferences.edit()) {
                putString(TOKEN_KEY, token)
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SAVE_TOKEN_ERROR", e)
        }
    }

    /**
     * EncryptedSharedPreferences에서 Access Token을 가져오는 메서드
     * @param promise Access Token 또는 null을 반환
     */
    @ReactMethod
    fun getAccessToken(promise: Promise) {
        try {
            val masterKey = MasterKey.Builder(reactApplicationContext)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            val sharedPreferences = EncryptedSharedPreferences.create(
                reactApplicationContext,
                PREFS_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )

            val token = sharedPreferences.getString(TOKEN_KEY, null)
            if (token != null) {
                promise.resolve(token)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("GET_TOKEN_ERROR", e)
        }
    }
}
