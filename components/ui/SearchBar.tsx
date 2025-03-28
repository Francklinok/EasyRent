import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';



interface SearchBarProps {
  children?: React.ReactNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({ children }) => {

  return (
    <View style={styles.searchBar}>
        {children}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 10,
    margin: 8,
  },
  input: {
    // flex: 1,
    fontSize: 16
  }
});
