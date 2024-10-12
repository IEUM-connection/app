import * as Keychain from 'react-native-keychain';

const KeychainManager = {
    async saveAuthToken(token) {
        try {
            await Keychain.setGenericPassword('authToken', token);
            console.log('Authentication token saved to keychain');
        } catch (error) {
            console.error('Error saving authentication token to keychain:', error);
        }
    },

    async getAuthToken() {
        try {
            const credentials = await Keychain.getGenericPassword();
            if (credentials) {
                return credentials.password;
            }
            return null;
        } catch (error) {
            console.error('Error getting authentication token from keychain:', error);
            return null;
        }
    },

    async removeAuthToken() {
        try {
            await Keychain.resetGenericPassword();
            console.log('Authentication token removed from keychain');
        } catch (error) {
            console.error('Error removing authentication token from keychain:', error);
        }
    }
};

export default KeychainManager;
