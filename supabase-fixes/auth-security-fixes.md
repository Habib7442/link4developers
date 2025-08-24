# Supabase Auth Security Fixes

## Issue 1: OTP Expiry Too Long

**Problem**: The email provider has OTP expiry set to more than an hour, which exceeds the recommended threshold.

**Solution**: 
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Find the "Email OTP Expiry" setting
4. Change it to 3600 seconds (1 hour) or less
5. Recommended value: 3600 seconds (1 hour)

## Issue 2: Leaked Password Protection Disabled

**Problem**: Leaked password protection is currently disabled. Supabase Auth can prevent the use of compromised passwords by checking against HaveIBeenPwned.org.

**Solution**:
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Find the "Leaked Password Protection" setting
4. Enable this feature to enhance security

## Implementation Steps

1. Log in to your Supabase Dashboard
2. Go to the Authentication section
3. Update the OTP expiry to 3600 seconds (1 hour)
4. Enable Leaked Password Protection
5. Save the changes

## Why These Changes Matter

### OTP Expiry
- Reduces the window of opportunity for attackers to use intercepted OTPs
- Aligns with security best practices
- Maintains a balance between security and user experience

### Leaked Password Protection
- Prevents users from using passwords that have been compromised in data breaches
- Protects your application and users from credential stuffing attacks
- Enhances overall security posture

## Verification

After implementing these changes:
1. Test the authentication flow to ensure OTPs expire within the expected timeframe
2. Try to register with a known compromised password to verify the protection is working
3. Monitor authentication logs for any issues

## Additional Security Recommendations

1. Enable Multi-Factor Authentication (MFA) for admin accounts
2. Regularly review and rotate API keys
3. Implement rate limiting for authentication endpoints
4. Monitor authentication logs for suspicious activity
5. Consider implementing IP allowlisting for administrative access