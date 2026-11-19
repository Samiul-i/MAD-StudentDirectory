// components/search-bar.tsx — forwardRef (Week 6) + configurable debounce delay (Feature 2)

import { forwardRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string; // the ? means this prop is optional
  // Feature 2 — configurable debounce delay (ms).
  // The debouncing itself runs in the parent screen via useDebounce; this
  // prop declares the delay the parent uses and exposes it for accessibility.
  debounceDelay?: number;
}

// forwardRef lets a parent pass a ref down into this component's TextInput.
// (ref is not a regular prop — React handles it specially, so forwardRef is required.)
const SearchBar = forwardRef<TextInput, SearchBarProps>(
  ({ value, onChangeText, placeholder, debounceDelay = 300 }, ref) => (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Search students..."}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing" // iOS only: shows × button
        returnKeyType="search"
        accessibilityHint={`Results update ${debounceDelay} milliseconds after you stop typing`}
      />
    </View>
  )
);

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1E293B",
  },
});
