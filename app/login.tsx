/**
 * Login Screen — Cora Cora Employee Portal
 * Dark Luxury Glassmorphism Redesign
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Animated,
  Dimensions, ActivityIndicator, Keyboard, Pressable, Image
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../src/context/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { theme } from '../src/theme/theme';

const { width, height } = Dimensions.get('window');
const REMEMBER_KEY = 'remember_credentials';

// 1. Static Particles Background
const ParticleField = () => {
  const [particles] = useState(() =>
    Array.from({ length: 38 }).map((_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="tealBlob" cx="50%" cy="10%" r="60%">
            <Stop offset="0%" stopColor="rgba(151, 202, 235, 0.12)" />
            <Stop offset="100%" stopColor="rgba(151, 202, 235, 0)" />
          </RadialGradient>
          <RadialGradient id="pinkBlob" cx="90%" cy="90%" r="60%">
            <Stop offset="0%" stopColor="rgba(248, 154, 186, 0.08)" />
            <Stop offset="100%" stopColor="rgba(248, 154, 186, 0)" />
          </RadialGradient>
        </Defs>
        <Circle cx={width * 0.5} cy={height * 0.1} r={width * 0.8} fill="url(#tealBlob)" />
        <Circle cx={width * 0.9} cy={height * 0.9} r={width * 0.8} fill="url(#pinkBlob)" />
      </Svg>
      {particles.map((p) => (
        <View key={p.id} style={{
          position: 'absolute', left: p.x, top: p.y, width: p.size, height: p.size,
          borderRadius: p.size / 2, backgroundColor: `rgba(0,196,179,${p.opacity})`
        }} />
      ))}
    </View>
  );
};


// 3. Luxury Input Field
interface LuxuryInputProps {
  label: string;
  icon: any;
  isPassword?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  error?: boolean;
}

const LuxuryInput = ({ label, icon, isPassword = false, value, onChangeText, editable = true, error = false }: LuxuryInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      tension: 100, friction: 8, useNativeDriver: false
    }).start();
  }, [isFocused, focusAnim]);

  const borderColor = error ? theme.colors.danger : focusAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.colors.borderLight, theme.colors.teal] }) as any;
  const labelColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.colors.textSecondary, theme.colors.teal] }) as any;
  const translateY = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -1] });

  return (
    <View style={{ marginBottom: 20 }}>
      <Animated.Text style={[styles.inputLabel, { color: labelColor }]}>{label}</Animated.Text>
      <Animated.View style={[styles.inputWrapper, { borderColor, transform: [{ translateY }] }]}>
        <Animated.View style={{ paddingLeft: 16, paddingRight: 12 }}>
          <MaterialCommunityIcons name={icon} size={20} color={isFocused ? theme.colors.teal : theme.colors.textSecondary} />
        </Animated.View>
        <TextInput
          style={styles.input}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPwd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 16 }}>
            <MaterialCommunityIcons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [validationError, setValidationError] = useState(false);

  // Entrance Animations
  const anims = useRef({
    logo: new Animated.Value(0),
    card: new Animated.Value(0),
    field1: new Animated.Value(0),
    field2: new Animated.Value(0),
    btn: new Animated.Value(0),
    footer: new Animated.Value(0)
  }).current;

  // Shake Animation for errors
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(REMEMBER_KEY);
        if (saved) {
          const { user_id, password: savedPwd } = JSON.parse(saved);
          setUserId(user_id || '');
          setPassword(savedPwd || '');
          setRememberMe(true);
        }
      } catch { }

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);
    })();

    // Staggered Entrance
    const springConfig = { tension: 60, friction: 8, useNativeDriver: true };
    Animated.stagger(120, [
      Animated.spring(anims.logo, { toValue: 1, ...springConfig }),
      Animated.spring(anims.card, { toValue: 1, ...springConfig }),
      Animated.spring(anims.field1, { toValue: 1, ...springConfig }),
      Animated.spring(anims.field2, { toValue: 1, ...springConfig }),
      Animated.spring(anims.btn, { toValue: 1, ...springConfig }),
      Animated.spring(anims.footer, { toValue: 1, ...springConfig }),
    ]).start();
  }, [anims]);

  const triggerShake = () => {
    setValidationError(true);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start(() => setValidationError(false));
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!userId.trim() || !password.trim()) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      await signIn({ user_id: userId.trim(), password });
      if (rememberMe) {
        await SecureStore.setItemAsync(REMEMBER_KEY, JSON.stringify({ user_id: userId.trim(), password }));
      } else {
        await SecureStore.deleteItemAsync(REMEMBER_KEY);
      }
    } catch (error: any) {
      triggerShake();
      const message = error?.message || 'Invalid credentials. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const getEntranceStyle = (animObj: Animated.Value) => ({
    opacity: animObj,
    transform: [{ translateY: animObj.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.dark as readonly [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      <ParticleField />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>

          <Animated.View style={[styles.header, getEntranceStyle(anims.logo)]}>
            <Image
              source={require('../assets/logo.png')}
              style={{ width: 160, height: 160, resizeMode: 'contain', marginBottom: 16 }}
            />
            <Text style={styles.portalLabel}>EMPLOYEE PORTAL</Text>
          </Animated.View>

          <Animated.View style={[getEntranceStyle(anims.card), { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.glassCardWrapper}>
              <View style={styles.glassCardInner}>

                <Animated.View style={getEntranceStyle(anims.field1)}>
                  <LuxuryInput
                    label="Employee ID" icon="card-account-details-outline"
                    value={userId} onChangeText={setUserId} editable={!isLoading} error={validationError && !userId.trim()}
                  />
                </Animated.View>

                <Animated.View style={getEntranceStyle(anims.field2)}>
                  <LuxuryInput
                    label="Password" icon="lock-outline" isPassword
                    value={password} onChangeText={setPassword} editable={!isLoading} error={validationError && !password.trim()}
                  />
                </Animated.View>

                <Animated.View style={[styles.optionsRow, getEntranceStyle(anims.field2)]}>
                  <TouchableOpacity style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.8}>
                    <View style={[styles.toggleTrack, rememberMe && styles.toggleTrackActive]}>
                      <View style={[styles.toggleKnob, rememberMe && styles.toggleKnobActive]} />
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.push('/forgot-password')} activeOpacity={0.7}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={getEntranceStyle(anims.btn)}>
                  <Pressable onPress={handleLogin} disabled={isLoading} style={({ pressed }) => [
                    styles.loginBtnWrapper,
                    pressed && { transform: [{ scale: 0.97 }] }
                  ]}>
                    <LinearGradient
                      colors={isLoading ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : (theme.gradients.sunset as readonly [string, string, ...string[]])}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.loginBtnGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={theme.colors.white} />
                      ) : (
                        <Text style={styles.loginBtnText}>Sign In</Text>
                      )}
                    </LinearGradient>
                  </Pressable>

                  {isBiometricSupported && (
                    <TouchableOpacity style={styles.bioButton} onPress={() => LocalAuthentication.authenticateAsync()} activeOpacity={0.7}>
                      <Ionicons name="finger-print" size={20} color={theme.colors.textSecondary} />
                      <Text style={styles.bioText}>Face ID / Touch ID</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>

              </View>
            </View>
          </Animated.View>

          <Animated.Text style={[styles.footer, getEntranceStyle(anims.footer)]}>
            Cora Cora Maldives © {new Date().getFullYear()}
          </Animated.Text>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgDarkDeep, // Fallback
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTitle: {
    fontFamily: theme.fonts.display,
    fontSize: 36,
    color: theme.colors.white,
    letterSpacing: 0,
  },
  brandSubtitle: {
    fontFamily: theme.fonts.headingM,
    fontSize: 16,
    color: theme.colors.teal,
    marginTop: -2,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  portalLabel: {
    fontFamily: theme.fonts.label,
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 12,
    letterSpacing: 2,
  },
  glassCardWrapper: {
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },
  glassCardInner: {
    backgroundColor: theme.colors.white,
    borderRadius: 28,
    padding: 32,
    paddingBottom: 28,
  },
  inputLabel: {
    fontFamily: theme.fonts.label,
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgPage,
    borderWidth: 1,
    borderRadius: 14,
    height: 56,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyM,
    fontSize: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  toggleTrackActive: {
    backgroundColor: 'rgba(0, 196, 179, 0.2)',
    borderColor: 'rgba(0, 196, 179, 0.4)',
  },
  toggleKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.textSecondary,
  },
  toggleKnobActive: {
    backgroundColor: theme.colors.teal,
    transform: [{ translateX: 16 }],
  },
  rememberText: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  forgotText: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 13,
    color: theme.colors.teal,
  },
  loginBtnWrapper: {
    height: 56,
    borderRadius: 14,
    shadowColor: theme.colors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  loginBtnGradient: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    fontFamily: theme.fonts.button,
    color: theme.colors.white,
    fontSize: 16,
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  bioText: {
    fontFamily: theme.fonts.bodyM,
    color: theme.colors.textPrimary,
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    fontFamily: theme.fonts.label,
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    marginTop: 40,
  }
});
