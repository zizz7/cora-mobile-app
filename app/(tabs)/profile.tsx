/**
 * Profile Screen — Premium hero with stats bar, clean contact list, toggle preferences.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView, Platform, Switch } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useUpdateProfile, useUpdateProfilePhoto } from '../../src/hooks/useProfile';
import { useLedger } from '../../src/hooks/useLedger';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AnimatedPressable from '../../src/components/AnimatedPressable';
import { theme } from '../../src/theme/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const updatePhoto = useUpdateProfilePhoto();
  const { data: ledgerData, isLoading: isLedgerLoading } = useLedger();

  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'push' | 'none'>('none');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone_number || '');
      setChannel(user.notification_channel || 'none');
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.teal} />
      </View>
    );
  }

  const handleSave = () => {
    updateProfile.mutate({ phone_number: phone, notification_channel: channel }, {
      onSuccess: () => Alert.alert('Success', 'Profile updated successfully.'),
      onError: () => Alert.alert('Error', 'Failed to update profile.'),
    });
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        }
      }
    ]);
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setIsUploadingPhoto(true);
        const { uri, type, fileName } = result.assets[0];
        const fileExt = fileName ? fileName.split('.').pop() : uri.split('.').pop();
        const mimeType = type === 'image' ? `image/${fileExt}` : 'image/jpeg';

        const formData = new FormData();
        formData.append('photo', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: fileName || `profile_photo.${fileExt}`,
          type: mimeType,
        } as any);

        updatePhoto.mutate(formData, {
          onSuccess: () => Alert.alert('Success', 'Profile photo updated!'),
          onError: () => Alert.alert('Error', 'Failed to update profile photo.'),
          onSettled: () => setIsUploadingPhoto(false),
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setIsUploadingPhoto(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const NOTIFICATION_OPTIONS = [
    { key: 'none' as const, icon: 'bell-off-outline', label: 'None' },
    { key: 'email' as const, icon: 'email-outline', label: 'Email' },
    { key: 'whatsapp' as const, icon: 'whatsapp', label: 'WhatsApp' },
    { key: 'push' as const, icon: 'cellphone-message', label: 'Push' },
  ];

  const renderAvatarContent = () => {
    if (isUploadingPhoto) {
      return <ActivityIndicator color={theme.colors.teal} />;
    }
    if (user.avatar_url && !user.avatar_url.includes('avatar-default.png')) {
      return <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />;
    }
    return <Text style={styles.avatarText}>{getInitials(user.name)}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Hero Section */}
        <LinearGradient
          colors={theme.gradients.ocean as readonly [string, string, ...string[]]}
          style={styles.hero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          {/* Avatar with double ring and camera icon */}
          <TouchableOpacity
            style={styles.avatarOuter}
            onPress={handlePickImage}
            activeOpacity={0.8}
            disabled={isUploadingPhoto}
          >
            <View style={styles.avatarInner}>
              {renderAvatarContent()}
            </View>
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={16} color={theme.colors.orange} />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.position} · {user.department}</Text>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{user.role_name}</Text>
          </View>
        </LinearGradient>

        {/* Stats Bar Container - City Ledger Balance */}
        <View style={styles.statsWrapper}>
          <TouchableOpacity
            style={styles.statsBar}
            onPress={() => router.push('/(tabs)/ledger')}
            activeOpacity={0.8}
          >
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: theme.colors.transparent.blue10 }]}>
                <Ionicons name="wallet" size={20} color={theme.colors.blue} />
              </View>
              {isLedgerLoading ? (
                <ActivityIndicator size="small" color={theme.colors.blue} style={{ marginVertical: 4 }} />
              ) : (
                <Text style={styles.statValue}>${ledgerData?.current_balance?.toFixed(2) || '0.00'}</Text>
              )}
              <Text style={styles.statLabel}>City Ledger Balance</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contact Information — Clean List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.contactRow}>
            <View style={styles.contactIconBg}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.teal} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>EMAIL</Text>
              <Text style={styles.contactValue}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.contactAction}>
              <Ionicons name="copy-outline" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.contactDivider} />

          <View style={styles.contactRow}>
            <View style={styles.contactIconBg}>
              <Ionicons name="call-outline" size={20} color={theme.colors.teal} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>PHONE</Text>
              <TextInput
                style={styles.contactValueEditable}
                placeholder="Add phone number"
                placeholderTextColor={theme.colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Notification Preferences — Toggle List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Text style={styles.sectionSubtitle}>Choose how you receive updates</Text>

          {NOTIFICATION_OPTIONS.map((opt, idx) => (
            <View key={opt.key}>
              <View style={styles.toggleRow}>
                <View style={[styles.toggleIconBg, channel === opt.key && { backgroundColor: theme.colors.transparent.teal10 }]}>
                  <MaterialCommunityIcons
                    name={opt.icon as any}
                    size={22}
                    color={channel === opt.key ? theme.colors.teal : theme.colors.textSecondary}
                  />
                </View>
                <Text style={[styles.toggleLabel, channel === opt.key && { color: theme.colors.textPrimary, fontFamily: theme.fonts.headingS }]}>
                  {opt.label}
                </Text>
                <Switch
                  value={channel === opt.key}
                  onValueChange={(val) => {
                    if (val) setChannel(opt.key);
                    else if (channel === opt.key) setChannel('none');
                  }}
                  trackColor={{ false: theme.colors.borderLight, true: theme.colors.transparent.teal10 }}
                  thumbColor={channel === opt.key ? theme.colors.teal : '#f4f3f4'}
                  ios_backgroundColor={theme.colors.borderLight}
                />
              </View>
              {idx < NOTIFICATION_OPTIONS.length - 1 && <View style={styles.toggleDivider} />}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <AnimatedPressable
          style={[styles.saveButton, updateProfile.isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </AnimatedPressable>

        <AnimatedPressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </AnimatedPressable>

        <Text style={styles.versionText}>Cora Cora Staff Portal v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.teal, // Matches ocean gradient start for seamless blend
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bgPage,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPage,
  },
  content: {
    paddingBottom: 40,
  },
  // ─── Hero ─────────────────────────────────
  hero: {
    paddingTop: Platform.OS === 'ios' ? 40 : 24,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    padding: 4,
    marginBottom: 16,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  avatarText: {
    fontFamily: theme.fonts.display,
    color: theme.colors.white,
    fontSize: 32,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.teal,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0B3658', // Approximating background color where badge sits
  },
  userName: {
    fontFamily: theme.fonts.display,
    fontSize: 30,
    color: theme.colors.white,
    marginBottom: 4,
  },
  userRole: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  heroBadgeText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.label,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // ─── Stats Bar ────────────────────────────
  statsWrapper: {
    paddingHorizontal: 24,
    marginTop: -32,
    marginBottom: 24,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.level2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: theme.fonts.display,
    fontSize: 24,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: theme.fonts.label,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.borderLight,
    alignSelf: 'center',
  },
  // ─── Sections ─────────────────────────────
  section: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: theme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.level1,
  },
  sectionTitle: {
    fontFamily: theme.fonts.headingM,
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    marginTop: -10,
  },
  // ─── Contact List ─────────────────────────
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.transparent.teal10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontFamily: theme.fonts.label,
    fontSize: 11,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  contactValue: {
    fontFamily: theme.fonts.headingS,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  contactValueEditable: {
    fontFamily: theme.fonts.headingS,
    fontSize: 16,
    color: theme.colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  contactAction: {
    padding: 8,
  },
  contactDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 16,
    marginLeft: 60,
  },
  // ─── Toggle Preferences ───────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgPage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toggleLabel: {
    flex: 1,
    fontFamily: theme.fonts.bodyM,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: 60,
  },
  // ─── Actions ──────────────────────────────
  saveButton: {
    backgroundColor: theme.colors.teal,
    marginHorizontal: 24,
    height: 56,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...theme.shadows.tealGlow,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.button,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 16,
  },
  logoutText: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.headingS,
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    fontFamily: theme.fonts.label,
    color: theme.colors.textTertiary,
    fontSize: 12,
    marginTop: 12,
    marginBottom: 24,
  },
});
