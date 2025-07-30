import { useState, useEffect } from "react";

export const useStudentStatistics = (timeFilter = "This Month") => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 1247,
    activeStudents: 892,
    averageGrade: 87.3,
    completionRate: 94.2,
  });
  const [progressData, setProgressData] = useState(null);
  const [gradeDistribution, setGradeDistribution] = useState(null);
  const [coursePerformance, setCoursePerformance] = useState(null);
  const [recentActivities, setRecentActivities] = useState(null);

  // Simulate API call with different data based on time filter
  const fetchStatistics = async (filter) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data that changes based on time filter
      const mockData = {
        "This Month": {
          stats: {
            totalStudents: 1247,
            activeStudents: 892,
            averageGrade: 87.3,
            completionRate: 94.2,
          },
          progressData: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [
              {
                label: "Active Students",
                data: [820, 850, 870, 892],
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                fill: true,
              },
              {
                label: "Course Completions",
                data: [180, 195, 205, 210],
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
        },
        "Last Month": {
          stats: {
            totalStudents: 1113,
            activeStudents: 825,
            averageGrade: 85.2,
            completionRate: 92.4,
          },
          progressData: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [
              {
                label: "Active Students",
                data: [780, 800, 810, 825],
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                fill: true,
              },
              {
                label: "Course Completions",
                data: [160, 170, 175, 180],
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
        },
        "This Quarter": {
          stats: {
            totalStudents: 1247,
            activeStudents: 892,
            averageGrade: 86.8,
            completionRate: 93.5,
          },
          progressData: {
            labels: ["Month 1", "Month 2", "Month 3"],
            datasets: [
              {
                label: "Active Students",
                data: [720, 825, 892],
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                fill: true,
              },
              {
                label: "Course Completions",
                data: [145, 180, 210],
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
        },
        "This Year": {
          stats: {
            totalStudents: 1247,
            activeStudents: 892,
            averageGrade: 86.1,
            completionRate: 92.8,
          },
          progressData: {
            labels: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            datasets: [
              {
                label: "Active Students",
                data: [
                  650, 720, 780, 820, 850, 892, 910, 925, 940, 955, 970, 985,
                ],
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                fill: true,
              },
              {
                label: "Course Completions",
                data: [
                  120, 145, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300,
                ],
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
        },
      };

      const selectedData = mockData[filter] || mockData["This Month"];

      setStats(selectedData.stats);
      setProgressData(selectedData.progressData);

      // Grade distribution remains constant for simplicity
      setGradeDistribution({
        labels: [
          "A (90-100%)",
          "B (80-89%)",
          "C (70-79%)",
          "D (60-69%)",
          "F (Below 60%)",
        ],
        datasets: [
          {
            data: [45, 30, 15, 7, 3],
            backgroundColor: [
              "#10B981",
              "#3B82F6",
              "#F59E0B",
              "#EF4444",
              "#6B7280",
            ],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      });

      // Course performance and recent activities remain constant
      setCoursePerformance(null); // Will use default data in component
      setRecentActivities(null); // Will use default data in component
    } catch (err) {
      setError(err.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics(timeFilter);
  }, [timeFilter]);

  return {
    stats,
    progressData,
    gradeDistribution,
    coursePerformance,
    recentActivities,
    loading,
    error,
    refetch: () => fetchStatistics(timeFilter),
  };
};
