// app/(tabs)/statistics.tsx — Week 6 Statistics screen
// useMemo: department breakdown, top-5 skills, and average skills/student (Feature 1).
// useRef: previous-count change badge that auto-clears (Feature 3).

import { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import StatBar from "../../components/stat-bar";
import { useStudents } from "../../context/students-context";

const BAR_COLOURS = [
  "#0D9488",
  "#185FA5",
  "#7C3AED",
  "#F59E0B",
  "#EF4444",
  "#059669",
];

export default function Statistics() {
  const { students } = useStudents();

  // Derived value 1: department breakdown.
  // Only recomputes when `students` changes.
  const deptStats = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.department] = (counts[s.department] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([dept, count]) => ({ dept, count }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  // Derived value 2: top skills ranking (top 5).
  const topSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      s.skills.forEach((skill) => {
        counts[skill] = (counts[skill] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [students]);

  // Feature 1: average number of skills per student.
  const avgSkills = useMemo(() => {
    if (students.length === 0) return "0.0";
    const total = students.reduce((sum, s) => sum + s.skills.length, 0);
    return (total / students.length).toFixed(1);
  }, [students]);

  // Feature 3: track the previous student count and flash a badge when it changes.
  const prevCount = useRef(students.length);
  const [countBadge, setCountBadge] = useState<{ text: string; up: boolean } | null>(null);

  useEffect(() => {
    const diff = students.length - prevCount.current;
    prevCount.current = students.length;
    if (diff === 0) return; // no change — nothing to show

    setCountBadge({
      text: diff > 0 ? `↑ ${diff} added` : `↓ ${Math.abs(diff)} removed`,
      up: diff > 0,
    });

    // Clear the badge after 2 seconds.
    const timer = setTimeout(() => setCountBadge(null), 2000);
    return () => clearTimeout(timer);
  }, [students.length]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          {countBadge && (
            <View
              style={[
                styles.countBadge,
                { backgroundColor: countBadge.up ? "#059669" : "#EF4444" },
              ]}
            >
              <Text style={styles.countBadgeText}>{countBadge.text}</Text>
            </View>
          )}
          <Text style={styles.summaryNumber}>{students.length}</Text>
          <Text style={styles.summaryLabel}>Total Students</Text>
        </View>

        {/* Feature 1 — average skills per student */}
        <View style={styles.avgCard}>
          <Text style={styles.avgNumber}>{avgSkills}</Text>
          <Text style={styles.avgLabel}>Avg Skills / Student</Text>
        </View>

        <Text style={styles.sectionTitle}>By Department</Text>
        <View style={styles.card}>
          {deptStats.map(({ dept, count }, i) => (
            <StatBar
              key={dept}
              label={dept}
              count={count}
              total={students.length}
              colour={BAR_COLOURS[i % BAR_COLOURS.length]}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Top Skills</Text>
        <View style={styles.card}>
          {topSkills.map(({ skill, count }, i) => (
            <View key={skill} style={styles.skillRow}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Text style={styles.skillName}>{skill}</Text>
              <Text style={styles.skillCount}>
                {count} student{count !== 1 ? "s" : ""}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F0F4F8" },
  content: { padding: 16, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: "#0D1F4E",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  summaryNumber: { fontSize: 48, fontWeight: "800", color: "#FFFFFF" },
  summaryLabel: { fontSize: 14, color: "#CCFBF1", marginTop: 4 },
  countBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countBadgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  avgCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avgNumber: { fontSize: 34, fontWeight: "800", color: "#0D9488" },
  avgLabel: { fontSize: 13, color: "#94A3B8", marginTop: 4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rank: { fontSize: 14, fontWeight: "700", color: "#0D9488", width: 32 },
  skillName: { flex: 1, fontSize: 14, color: "#334155" },
  skillCount: { fontSize: 12, color: "#94A3B8" },
});
