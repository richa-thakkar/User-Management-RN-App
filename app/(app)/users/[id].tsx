import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppHooks';
import { clearSelectedUser, deleteUserAsync, fetchUserByIdAsync } from '../../../store/usersSlice';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedUser, detailStatus, users } = useAppSelector((state) => state.users);

  // Optimistically use local user from the list if the detail fetch is pending or failed
  const localUser = selectedUser || users.find(u => String(u.id) === String(id));

  useEffect(() => {
    if (id) dispatch(fetchUserByIdAsync(id));
    return () => { dispatch(clearSelectedUser()); };
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${selectedUser?.first_name} ${selectedUser?.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!localUser) return;
            const result = await dispatch(deleteUserAsync(localUser.id));
            if (deleteUserAsync.fulfilled.match(result)) {
              Toast.show({ type: 'success', text1: 'Deleted', text2: 'User removed' });
              router.back();
            }
          },
        },
      ]
    );
  };

  if (detailStatus === 'loading' && !localUser) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#3B82F6" size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!localUser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${localUser.first_name} ${localUser.last_name}`,
          headerBackTitle: 'Users',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: localUser.avatar }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.name}>
            {localUser.first_name} {localUser.last_name}
          </Text>
          <Text style={styles.email}>{localUser.email}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>ID #{localUser.id}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>First Name</Text>
            <Text style={styles.infoValue}>{localUser.first_name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Name</Text>
            <Text style={styles.infoValue}>{localUser.last_name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{localUser.email}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          testID="edit-user-button"
          style={styles.editBtn}
          onPress={() => router.push(`/(app)/users/${localUser.id}/edit` as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.editBtnText}>✏️  Edit User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="delete-user-button"
          style={styles.deleteBtn}
          onPress={handleDelete}
          activeOpacity={0.85}
        >
          <Text style={styles.deleteBtnText}>🗑  Delete User</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: '#94A3B8', fontSize: 15, marginTop: 8 },
  errorIcon: { fontSize: 48 },
  errorText: { color: '#94A3B8', fontSize: 17 },
  backBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 8,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  name: { fontSize: 24, fontWeight: '700', color: '#F1F5F9', marginBottom: 6 },
  email: { fontSize: 14, color: '#94A3B8', marginBottom: 12 },
  idBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  idText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: { color: '#64748B', fontSize: 14 },
  infoValue: { color: '#F1F5F9', fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#0F172A' },
  editBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  editBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteBtnText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});
