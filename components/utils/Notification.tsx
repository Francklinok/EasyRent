import React from "react";
import { View, Text } from "react-native";
import { NotifyType } from "@/types/NotificationTypes";

 
const NotificationBadge: React.FC<NotifyType> = ({ count }) => {
  if (!count || count <= 0) return null;

  return (
    <View className="border bg-red-500 px-3 py-1 rounded-full">
      <Text className="text-[12px] text-white font-bold">{count}</Text>
    </View>
  );
};

export default NotificationBadge;
