/**
 * SMS Utility
 * Send SMS messages with SOS functionality and fallback handling
 */

import * as SMS from 'expo-sms';
import { Linking, Platform, Alert } from 'react-native';

// Default SOS message
export const SOS_MESSAGE = "Hey, I'm having a hard time. Can you talk?";

// Alternative messages
export const SOS_MESSAGES = {
  default: SOS_MESSAGE,
  urgent: "I really need to talk. Are you available?",
  checking_in: "Hey, just checking in. Do you have a few minutes?",
  struggling: "I'm struggling right now and could use some support.",
};

interface SendSMSResult {
  success: boolean;
  error?: string;
}

/**
 * Check if SMS is available on this device
 */
export async function isSMSAvailable(): Promise<boolean> {
  try {
    return await SMS.isAvailableAsync();
  } catch (error) {
    console.error('Error checking SMS availability:', error);
    return false;
  }
}

/**
 * Send an SMS message
 * @param phoneNumber - Recipient phone number
 * @param message - Message to send
 * @returns Result indicating success or failure
 */
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<SendSMSResult> {
  try {
    // Check if SMS is available
    const available = await isSMSAvailable();
    
    if (!available) {
      // Fallback to Linking API
      return await sendSMSViaLinking(phoneNumber, message);
    }

    // Use expo-sms
    const { result } = await SMS.sendSMSAsync([phoneNumber], message);
    
    // Check result - 'sent' means user sent, 'cancelled' means they cancelled
    return {
      success: result === 'sent',
      error: result === 'cancelled' ? 'Message cancelled by user' : undefined,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Try fallback
    try {
      return await sendSMSViaLinking(phoneNumber, message);
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Failed to send message. Please try calling instead.',
      };
    }
  }
}

/**
 * Send SMS via Linking API (fallback method)
 * This opens the SMS app with pre-filled content
 */
async function sendSMSViaLinking(
  phoneNumber: string,
  message: string
): Promise<SendSMSResult> {
  try {
    // Format the phone number (remove spaces and special chars except +)
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Create SMS URL (different format for iOS and Android)
    const smsUrl = Platform.select({
      ios: `sms:${cleanedNumber}&body=${encodedMessage}`,
      android: `sms:${cleanedNumber}?body=${encodedMessage}`,
      default: `sms:${cleanedNumber}?body=${encodedMessage}`,
    });

    const canOpen = await Linking.canOpenURL(smsUrl);
    
    if (!canOpen) {
      return {
        success: false,
        error: 'Unable to open SMS app',
      };
    }

    await Linking.openURL(smsUrl);
    
    // We can't know if the user actually sent the message
    // when using Linking, so we assume success
    return { success: true };
  } catch (error) {
    console.error('Error with SMS linking fallback:', error);
    return {
      success: false,
      error: 'Failed to open SMS app',
    };
  }
}

/**
 * Send SOS message to a contact
 * Shows confirmation and handles result
 */
export async function sendSOSMessage(
  phoneNumber: string,
  contactName: string,
  customMessage?: string
): Promise<SendSMSResult> {
  const message = customMessage || SOS_MESSAGE;
  
  return new Promise((resolve) => {
    Alert.alert(
      'Send SOS Message?',
      `Send "${message}" to ${contactName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve({ success: false, error: 'Cancelled' }),
        },
        {
          text: 'Send',
          onPress: async () => {
            const result = await sendSMS(phoneNumber, message);
            
            if (result.success) {
              Alert.alert('Message Sent', `Your message was sent to ${contactName}.`);
            } else if (result.error && result.error !== 'Cancelled') {
              Alert.alert('Message Failed', result.error);
            }
            
            resolve(result);
          },
        },
      ]
    );
  });
}

/**
 * Quick send SOS without confirmation (for emergency use)
 */
export async function quickSendSOS(
  phoneNumber: string
): Promise<SendSMSResult> {
  return sendSMS(phoneNumber, SOS_MESSAGE);
}

/**
 * Make a phone call
 * Falls back to tel: linking if expo-linking fails
 */
export async function makePhoneCall(phoneNumber: string): Promise<boolean> {
  try {
    // Format the phone number
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    const telUrl = `tel:${cleanedNumber}`;
    
    const canOpen = await Linking.canOpenURL(telUrl);
    
    if (!canOpen) {
      Alert.alert('Cannot Make Call', 'Phone calls are not available on this device.');
      return false;
    }

    await Linking.openURL(telUrl);
    return true;
  } catch (error) {
    console.error('Error making phone call:', error);
    Alert.alert('Call Failed', 'Unable to make the call. Please try again.');
    return false;
  }
}

/**
 * Open the default messaging app (without pre-filled message)
 */
export async function openMessagingApp(phoneNumber: string): Promise<boolean> {
  try {
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    const smsUrl = Platform.OS === 'ios' ? `sms:${cleanedNumber}` : `sms:${cleanedNumber}`;
    
    const canOpen = await Linking.canOpenURL(smsUrl);
    
    if (!canOpen) {
      return false;
    }

    await Linking.openURL(smsUrl);
    return true;
  } catch (error) {
    console.error('Error opening messaging app:', error);
    return false;
  }
}

