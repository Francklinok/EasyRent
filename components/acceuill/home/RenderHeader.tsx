import React from "react";
import { BlurView } from "expo-blur";
import { ThemedView } from "@/components/ui/ThemedView";

import  RenderCategoryTabs from  "@/components/acceuill/home/renderCategory"

interface Props {
  viewType: "grid" | "list";
  setViewType: React.Dispatch<React.SetStateAction<"grid" | "list">>;
  setFilterModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scrollY: Animated.Value;


}

  const RenderHeader:React.FC<Props> = ({viewType,setViewType,setFilterModalVisible, scrollY}) => {
    return (
    <ThemedView>
        <ThemedView className="flex-row justify-between items-center">
          <ThemedView className="flex-1">
               <RenderCategoryTabs/>
          </ThemedView>
        </ThemedView>
      </ThemedView>
  )};
export  default RenderHeader;