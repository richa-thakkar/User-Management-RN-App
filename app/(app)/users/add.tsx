import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppHooks';
import { createUserAsync } from '../../../store/usersSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  job?: string;
}

export default function AddUserScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useAppSelector((state) => state.users);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [job, setJob] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Image picker — bonus feature
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.first_name = 'First name is required';
    if (!lastName.trim()) newErrors.last_name = 'Last name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email';
    }
    if (!job.trim()) newErrors.job = 'Job title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const result = await dispatch(
      createUserAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        job: job.trim(),
        avatar: avatar || undefined,
      })
    );
    setSubmitting(false);
    if (createUserAsync.fulfilled.match(result)) {
      Toast.show({ type: 'success', text1: 'User Created!', text2: `${firstName} ${lastName} added.` });
      router.back();
    } else {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create user' });
    }
  };

  return (
    <>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <Stack.Screen options={{ title: 'Add User', headerBackTitle: 'Users' , }}  />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#0F172A', }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Avatar Picker */}
          <TouchableOpacity style={styles.avatarPicker} onPress={pickImage} testID="avatar-picker">
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarPreview} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarIcon}>📷</Text>
                <Text style={styles.avatarHint}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.card}>
            <Field
              label="First Name"
              value={firstName}
              onChange={(v) => { setFirstName(v); setErrors((e) => ({ ...e, first_name: undefined })); }}
              placeholder="John"
              error={errors.first_name}
              testID="first-name-input"
            />
            <Field
              label="Last Name"
              value={lastName}
              onChange={(v) => { setLastName(v); setErrors((e) => ({ ...e, last_name: undefined })); }}
              placeholder="Doe"
              error={errors.last_name}
              testID="last-name-input"
            />
            <Field
              label="Email"
              value={email}
              onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
              placeholder="john@example.com"
              error={errors.email}
              keyboardType="email-address"
              testID="email-input"
            />
            
          </View>

          <TouchableOpacity
            testID="submit-button"
            style={[styles.submitBtn, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Create User</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// Reusable Field component
function Field({
  label, value, onChange, placeholder, error, keyboardType, testID,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  keyboardType?: any;
  testID?: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        testID={testID}
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        keyboardType={keyboardType || 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  avatarPicker: {
    alignSelf: 'center',
    marginBottom: 24,
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  avatarIcon: { fontSize: 28 },
  avatarHint: { color: '#64748B', fontSize: 11, textAlign: 'center' },
  avatarPreview: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#3B82F6' },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#F1F5F9',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  submitBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
