import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../types/user';

interface Props {
  user: User;
  onPress: () => void;
  onLongPress: () => void;
}

export default function UserCard({ user, onPress, onLongPress }: Props) {
  const initials = `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();

  return (
    <TouchableOpacity
      testID={`user-card-${user.id}`}
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
          defaultSource={{ uri: `https://ui-avatars.com/api/?name=${initials}&background=3B82F6&color=fff` }}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
      </View>
      <View style={styles.chevronContainer}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 3,
  },
  email: {
    fontSize: 13,
    color: '#94A3B8',
  },
  chevronContainer: {
    paddingLeft: 8,
  },
  chevron: {
    fontSize: 22,
    color: '#475569',
    fontWeight: '300',
  },
});
