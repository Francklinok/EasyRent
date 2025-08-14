import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { UserData } from '@/components/services/userService';

export const useUser = () => {
  const { user, updateProfile, refreshProfile, fetchUserData, loading } = useAuth();

  const updateUserProfile = async (data: Partial<UserData>) => {
    return updateProfile(data);
  };

  const refreshUserData = async () => {
    await refreshProfile();
  };

  const getUserFullName = (): string => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const isUserActive = (): boolean => {
    return user?.isActive ?? false;
  };

  const getUserRole = (): string => {
    return user?.role ?? 'user';
  };

  const hasUserPhoto = (): boolean => {
    return !!user?.photo;
  };

  return {
    user,
    loading,
    updateUserProfile,
    refreshUserData,
    fetchUserData,
    getUserFullName,
    isUserActive,
    getUserRole,
    hasUserPhoto,
  };
};