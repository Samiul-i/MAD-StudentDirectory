// app/(tabs)/index.tsx — Week 6: useDebounce + useMemo + useCallback + useRef

import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import SearchBar from "../../components/search-bar";
import StudentDetail from "../../components/student-detail";
import StudentItem from "../../components/student-item";
import { useStudents } from "../../context/students-context";
import { Student } from "../../data/students";
import { useDebounce } from "../../hooks/use-debounce";

// Feature 2 — the search debounce delay, configurable in one place.
const DEBOUNCE_DELAY = 300;

export default function Index() {
  // Read students directly from the global context
  const { students, dispatch } = useStudents();

  // These stay as local state — they belong to this screen only
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Debounce the query — the filter only runs DEBOUNCE_DELAY ms after typing stops.
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);

  // Ref to the search input — used to auto-focus it on mount (no re-render).
  const searchRef = useRef<TextInput>(null);

  // Focus the search bar 300ms after mount (lets the tab slide-in animation finish).
  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []); // [] — run once on mount only

  // Only recomputes when `students` or `debouncedQuery` change.
  // Tapping a student (setSelectedStudent) does NOT re-run this.
  const filtered = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [students, debouncedQuery]);

  // Stable handler reference — setSelectedStudent is stable, so [] is correct.
  const handleSelect = useCallback((student: Student) => {
    setSelectedStudent((prev) => (prev?.id === student.id ? null : student));
  }, []);

  // Lab Task Feature 1 — Reset button with confirmation dialog
  const handleReset = () => {
    Alert.alert(
      "Reset Directory",
      "This will restore the original student list. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "RESET" });
            setSelectedStudent(null); // clear any selected student
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.titleBar}>
        {/* Lab Task Feature 2 — live student count derived from context */}
        <Text style={styles.title}>Student Directory ({students.length})</Text>

        <View style={styles.titleActions}>
          {/* Reset button */}
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>

          {/* Navigate to AddStudent screen — no prop passing needed */}
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/(tabs)/add-student")}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      <SearchBar
        ref={searchRef}
        value={query}
        onChangeText={setQuery}
        debounceDelay={DEBOUNCE_DELAY}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentItem
            student={item}
            onPress={handleSelect}
            isSelected={selectedStudent?.id === item.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No students match "{query}"</Text>
          </View>
        }
      />

      {selectedStudent && <StudentDetail student={selectedStudent} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F0F4F8" },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0D1F4E",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", flex: 1 },
  titleActions: {
    flexDirection: "row",
    gap: 8,
  },
  resetButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetButtonText: { color: "#EF4444", fontWeight: "700", fontSize: 13 },
  addButton: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94A3B8" },
});
