import * as Network from 'expo-network';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import Toast from 'react-native-toast-message';
import UserCard from '../../../components/UserCard';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppHooks';
import { logout } from '../../../store/authSlice';
import {
    deleteUserAsync,
    fetchUsersAsync,
    resetUsers,
    setOffline,
} from '../../../store/usersSlice';
import { User } from '../../../types/user';

export default function UsersScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const { users, status, currentPage, totalPages, isOffline, error } = useAppSelector(
    (state) => state.users
  );
  const [clientPage, setClientPage] = useState(1);
  const pageSize = 10;
  const pagerRef = useRef<PagerView | null>(null);

  // Check network & load on mount
  useEffect(() => {
    // hide default header/title added by the navigator
    if (navigation && (navigation as any).setOptions) {
      (navigation as any).setOptions({ headerShown: false, title: '' });
    }
    checkNetworkAndLoad();
  }, []);

  const checkNetworkAndLoad = async () => {
    const networkState = await Network.getNetworkStateAsync();
    const online = networkState.isConnected && networkState.isInternetReachable;
    dispatch(setOffline(!online));
    dispatch(resetUsers());
    // Load first page and then eagerly prefetch remaining pages (to reach 50 users)
    const first = await dispatch(fetchUsersAsync(1));
    setClientPage(1);

    if (fetchUsersAsync.fulfilled.match(first)) {
      const total = (first.payload as any)?.total_pages ?? totalPages;
      if (total > 1) {
        const toFetch: Promise<any>[] = [];
        for (let p = 2; p <= total; p++) {
          toFetch.push(dispatch(fetchUsersAsync(p)));
        }
        // fire all page fetches in parallel for faster preload
        await Promise.all(toFetch);
      }
    }
  };

  // Show error toast
  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error });
    }
  }, [error]);

  // Ensure we have enough loaded users for a given client page (10 per page)
  const ensureUsersForClientPage = async (page: number) => {
    const neededCount = page * pageSize;
    if (users.length >= neededCount) return;
    const requiredApiPage = Math.ceil(neededCount / pageSize);
    // fetch API pages until we reach requiredApiPage or fail
    let loadedApiPage = currentPage;
    while (loadedApiPage < requiredApiPage && status !== 'loading' && loadedApiPage < totalPages) {
      // eslint-disable-next-line no-await-in-loop
      const res: any = await dispatch(fetchUsersAsync(loadedApiPage + 1));
      if (fetchUsersAsync.rejected.match(res)) break;
      const payloadPage = (res.payload as any)?.page;
      loadedApiPage = payloadPage ?? loadedApiPage + 1;
    }
  };

  const handlePrevClientPage = () => {
    if (clientPage > 1) {
      const newPage = clientPage - 1;
      setClientPage(newPage);
      if (pagerRef.current && (pagerRef.current as any).setPage) (pagerRef.current as any).setPage(newPage - 1);
    }
  };

  const handleNextClientPage = async () => {
    const newPage = clientPage + 1;
    setClientPage(newPage);
    if (pagerRef.current && (pagerRef.current as any).setPage) (pagerRef.current as any).setPage(newPage - 1);
    await ensureUsersForClientPage(newPage);
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.first_name} ${user.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await dispatch(deleteUserAsync(user.id));
            if (deleteUserAsync.fulfilled.match(result)) {
              Toast.show({ type: 'success', text1: 'Deleted', text2: 'User removed successfully' });
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const renderFooter = () => {
    if (status !== 'loading' || users.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#3B82F6" size="small" />
        <Text style={styles.footerText}>Loading...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (status === 'loading') {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color="#3B82F6" size="large" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      );
    }
    if (status === 'failed') {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>😕</Text>
          <Text style={styles.emptyTitle}>Failed to load users</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={checkNetworkAndLoad}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Users</Text>
          <Text style={styles.headerSub}>{users.length} members</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} testID="logout-button">
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📡 Offline — Showing cached data</Text>
        </View>
      )}

      {/* User List */}
      {/* Swipeable pager showing client-side pages (10 users each) */}
      <View style={{ flex: 1 }}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={clientPage - 1}
          onPageSelected={async (e: any) => {
            const newClientPage = e.nativeEvent.position + 1;
            setClientPage(newClientPage);
            await ensureUsersForClientPage(newClientPage);
          }}
        >
          {Array.from({ length: Math.max(1, totalPages) }).map((_, idx) => {
            const pageIdx = idx + 1;
            const pageData = users.slice((pageIdx - 1) * pageSize, pageIdx * pageSize);
            return (
              <View key={`page-${idx}`} style={{ flex: 1 }}>
                <FlatList
                  data={pageData}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <UserCard
                      user={item}
                      onPress={() => router.push(`/(app)/users/${item.id}` as any)}
                      onLongPress={() => handleDeleteUser(item)}
                    />
                  )}
                  contentContainerStyle={pageData.length === 0 ? { flex: 1 } : { paddingVertical: 8, paddingBottom: 120 }}
                  ListEmptyComponent={renderEmpty}
                  ListFooterComponent={renderFooter}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            );
          })}
        </PagerView>
      </View>

      {/* Pagination controls */}
      <View style={styles.pagination}>
        <TouchableOpacity onPress={handlePrevClientPage} disabled={clientPage <= 1 || status === 'loading'} style={[styles.pageButton, clientPage <= 1 && styles.pageButtonDisabled]}>
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>{`Page ${clientPage} / ${Math.max(1, totalPages)}`}</Text>

        <TouchableOpacity onPress={handleNextClientPage} disabled={clientPage >= Math.max(1, totalPages) || status === 'loading'} style={[styles.pageButton, clientPage >= Math.max(1, totalPages) && styles.pageButtonDisabled]}>
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* FAB */}
      <TouchableOpacity
        testID="add-user-fab"
        style={styles.fab}
        onPress={() => router.push('/(app)/users/add' as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  headerSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  offlineBanner: {
    backgroundColor: '#78350F',
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FEF3C7',
    fontWeight: '600',
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 15,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#94A3B8',
    fontSize: 17,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: '12%',
    right: '4%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
    marginBottom: '10%',
  },
  pageButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  pageInfo: {
    color: '#94A3B8',
    fontSize: 14,
    marginHorizontal: 12,
  },
});
