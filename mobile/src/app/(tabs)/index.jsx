import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useAudioPlayer } from "expo-audio";
import {
  Users,
  DollarSign,
  Clock,
  Briefcase,
  Volume2,
  MapPin,
  TrendingUp,
  Calendar,
  Navigation,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react-native";

const LANGUAGES = {
  en: "English",
  hi: "हिंदी",
  bho: "भोजपुरी",
  other: "Other",
};

const TRANSLATIONS = {
  en: {
    title: "MGNREGA Dashboard",
    selectLanguage: "Select Language",
    currentDistrict: "Current District",
    detectingLocation: "Detecting your location...",
    useLocation: "Use My Location",
    jobsProvided: "Jobs Provided",
    wagesPaid: "Wages Paid",
    pendingPayments: "Pending Payments",
    personDays: "Person-Days",
    monthlyTrend: "Monthly Trend",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    playAudio: "Play Audio Explanation",
    searchDistrict: "Search District...",
    selectDistrict: "Select District",
    refreshData: "Refresh Data",
    reportIssue: "Report Issue",
    lastUpdated: "Last Updated",
    offline: "Offline Mode",
    dataUnavailable: "Data not available",
  },
  hi: {
    title: "MGNREGA डैशबोर्ड",
    selectLanguage: "भाषा चुनें",
    currentDistrict: "वर्तमान जिला",
    detectingLocation: "आपका स्थान खोजा जा रहा है...",
    useLocation: "मेरा स्थान उपयोग करें",
    jobsProvided: "प्रदान किए गए काम",
    wagesPaid: "भुगतान की गई मजदूरी",
    pendingPayments: "लंबित भुगतान",
    personDays: "व्यक्ति-दिन",
    monthlyTrend: "मासिक रुझान",
    thisMonth: "इस महीने",
    lastMonth: "पिछले महीने",
    playAudio: "ऑडियो स्पष्टीकरण सुनें",
    searchDistrict: "जिला खोजें...",
    selectDistrict: "जिला चुनें",
    refreshData: "डेटा रिफ्रेश करें",
    reportIssue: "समस्या की रिपोर्ट करें",
    lastUpdated: "अंतिम अपडेट",
    offline: "ऑफलाइन मोड",
    dataUnavailable: "डेटा उपलब्ध नहीं है",
  },
};

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [districtData, setDistrictData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [trends, setTrends] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  // Audio for explanations (mock audio sources - would be real audio files)
  const audioSources = {
    jobs: "https://example.com/audio/jobs-explanation-hindi.mp3",
    wages: "https://example.com/audio/wages-explanation-hindi.mp3",
    pending: "https://example.com/audio/pending-explanation-hindi.mp3",
    personDays: "https://example.com/audio/person-days-explanation-hindi.mp3",
  };

  // Load initial district data
  useEffect(() => {
    loadDefaultDistrict();
  }, []);

  // Load data when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData();
    }
  }, [selectedDistrict]);

  const loadDefaultDistrict = async () => {
    try {
      // Set Raipur as default
      setSelectedDistrict({
        id: 1,
        name: "Raipur",
        state: "Chhattisgarh",
        district_code: "CG01",
      });
    } catch (error) {
      console.error("Error loading default district:", error);
    }
  };

  const loadDistrictData = async () => {
    if (!selectedDistrict) return;

    setIsLoadingData(true);
    try {
      const response = await fetch(
        `/api/mgnrega-data?districtId=${selectedDistrict.id}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load data");
      }

      const data = await response.json();

      if (data.success) {
        setDistrictData(data.currentData);
        setHistoricalData(data.historicalData || []);
        setTrends(data.trends || {});
        setLastUpdated(data.currentData?.last_updated);
        setIsOffline(false);
      } else {
        throw new Error(data.error || "Failed to load data");
      }
    } catch (error) {
      console.error("Error loading district data:", error);
      setIsOffline(true);
      // Keep existing data for offline mode
      Alert.alert(
        "Connection Error",
        "Using cached data. Some information may be outdated.",
        [{ text: "OK" }],
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  const useMyLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to auto-detect your district.",
          [{ text: "OK" }],
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      const response = await fetch("/api/districts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedDistrict(data.district);
          Alert.alert(
            "Location Detected",
            `Found your district: ${data.district.name}`,
            [{ text: "OK" }],
          );
        }
      } else {
        throw new Error("Failed to detect district");
      }
    } catch (error) {
      console.error("Error detecting location:", error);
      Alert.alert(
        "Location Error",
        "Could not detect your district. Please select manually.",
        [{ text: "OK" }],
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const playAudioExplanation = (metric) => {
    // Mock audio explanation - in real app would play actual Hindi audio
    const explanations = {
      jobs: `${selectedDistrict?.name} में इस महीने ${districtData?.jobs_provided || 0} नौकरियां प्रदान की गईं`,
      wages: `${districtData?.wages_paid_percentage || 0} प्रतिशत मजदूरी का भुगतान किया गया`,
      pending: `${districtData?.pending_payments_crores || 0} करोड़ रुपए लंबित भुगतान`,
      personDays: `${districtData?.person_days || 0} व्यक्ति-दिन काम पूरा हुआ`,
    };

    Alert.alert(
      "Audio Explanation / ऑडियो स्पष्टीकरण",
      explanations[metric] || "Audio explanation would play here",
      [{ text: "OK" }],
    );
  };

  const getMetricColor = (metric, value) => {
    switch (metric) {
      case "wages":
        return value >= 90 ? "#10B981" : value >= 70 ? "#F59E0B" : "#EF4444";
      case "pending":
        return value <= 10 ? "#10B981" : value <= 20 ? "#F59E0B" : "#EF4444";
      default:
        return "#1E40AF";
    }
  };

  const MetricCard = ({
    icon: Icon,
    title,
    value,
    unit,
    trend,
    metric,
    onPlayAudio,
  }) => {
    const color = getMetricColor(metric, value);
    const trendColor = trend?.startsWith("+") ? "#10B981" : "#EF4444";

    return (
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 20,
          margin: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 5,
          flex: 1,
          minHeight: 140,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: color + "15",
                borderRadius: 12,
                padding: 8,
                alignSelf: "flex-start",
                marginBottom: 12,
              }}
            >
              <Icon size={24} color={color} />
            </View>

            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                fontWeight: "600",
                marginBottom: 6,
                lineHeight: 18,
              }}
            >
              {title}
            </Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 6,
              }}
            >
              {value?.toLocaleString() || 0}
              {unit && (
                <Text style={{ fontSize: 16, color: "#6B7280" }}> {unit}</Text>
              )}
            </Text>

            {trend && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TrendingUp size={14} color={trendColor} />
                <Text
                  style={{
                    fontSize: 13,
                    color: trendColor,
                    marginLeft: 4,
                    fontWeight: "600",
                  }}
                >
                  {trend}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={onPlayAudio}
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 24,
              padding: 10,
              marginLeft: 8,
            }}
          >
            <Volume2 size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />

      {/* Enhanced Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#1F2937" }}
            >
              {t.title}
            </Text>

            {selectedDistrict && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <MapPin size={16} color="#6B7280" />
                <Text style={{ fontSize: 16, color: "#6B7280", marginLeft: 6 }}>
                  {t.currentDistrict}: {selectedDistrict.name}
                </Text>
              </View>
            )}

            {isOffline && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <AlertTriangle size={14} color="#F59E0B" />
                <Text style={{ fontSize: 12, color: "#F59E0B", marginLeft: 4 }}>
                  {t.offline}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowLanguageSelector(!showLanguageSelector)}
            style={{
              backgroundColor: "#F3F4F6",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 13, color: "#374151", fontWeight: "500" }}>
              {LANGUAGES[selectedLanguage]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={useMyLocation}
            disabled={isLoadingLocation}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isLoadingLocation ? "#E5E7EB" : "#1E40AF",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              flex: 1,
            }}
          >
            <Navigation size={16} color="white" />
            <Text
              style={{
                color: "white",
                marginLeft: 8,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              {isLoadingLocation ? t.detectingLocation : t.useLocation}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={loadDistrictData}
            disabled={isLoadingData}
            style={{
              backgroundColor: "#10B981",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <RefreshCw size={16} color="white" />
          </TouchableOpacity>
        </View>

        {showLanguageSelector && (
          <View
            style={{
              position: "absolute",
              top: insets.top + 80,
              right: 20,
              backgroundColor: "white",
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
              zIndex: 1000,
            }}
          >
            {Object.entries(LANGUAGES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setSelectedLanguage(key);
                  setShowLanguageSelector(false);
                }}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: key === "other" ? 0 : 1,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                <Text
                  style={{
                    color: selectedLanguage === key ? "#1E40AF" : "#374151",
                    fontWeight: selectedLanguage === key ? "600" : "normal",
                    fontSize: 15,
                  }}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Metrics Grid */}
        <View style={{ padding: 4 }}>
          <View style={{ flexDirection: "row" }}>
            <MetricCard
              icon={Briefcase}
              title={t.jobsProvided}
              value={districtData?.jobs_provided}
              trend={trends.jobs}
              metric="jobs"
              onPlayAudio={() => playAudioExplanation("jobs")}
            />
            <MetricCard
              icon={DollarSign}
              title={t.wagesPaid}
              value={districtData?.wages_paid_percentage}
              unit="%"
              trend={trends.wages}
              metric="wages"
              onPlayAudio={() => playAudioExplanation("wages")}
            />
          </View>

          <View style={{ flexDirection: "row" }}>
            <MetricCard
              icon={Clock}
              title={t.pendingPayments}
              value={districtData?.pending_payments_crores}
              unit="₹ Cr"
              trend={trends.pending}
              metric="pending"
              onPlayAudio={() => playAudioExplanation("pending")}
            />
            <MetricCard
              icon={Users}
              title={t.personDays}
              value={districtData?.person_days}
              trend={trends.personDays}
              metric="personDays"
              onPlayAudio={() => playAudioExplanation("personDays")}
            />
          </View>
        </View>

        {/* Monthly Performance with better visualization */}
        <View
          style={{
            backgroundColor: "white",
            margin: 16,
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Calendar size={22} color="#1E40AF" />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#1F2937",
                marginLeft: 12,
              }}
            >
              {t.monthlyTrend}
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  color: "#6B7280",
                  marginBottom: 12,
                  fontWeight: "500",
                }}
              >
                {t.thisMonth}
              </Text>
              <View
                style={{
                  backgroundColor: "#1E40AF",
                  height: 10,
                  borderRadius: 5,
                  width: "85%",
                }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginTop: 8,
                }}
              >
                85%
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  color: "#6B7280",
                  marginBottom: 12,
                  fontWeight: "500",
                }}
              >
                {t.lastMonth}
              </Text>
              <View
                style={{
                  backgroundColor: "#E5E7EB",
                  height: 10,
                  borderRadius: 5,
                  width: "73%",
                }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#6B7280",
                  marginTop: 8,
                }}
              >
                73%
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Quick Actions */}
        <View
          style={{
            backgroundColor: "white",
            margin: 16,
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: 20,
            }}
          >
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => {
              /* Navigate to district selector */
            }}
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <MapPin size={22} color="#1E40AF" />
            <Text
              style={{
                fontSize: 17,
                color: "#374151",
                marginLeft: 16,
                flex: 1,
                fontWeight: "500",
              }}
            >
              Change District
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              /* Navigate to issue reporting */
            }}
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: 12,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MessageSquare size={22} color="#D97706" />
            <Text
              style={{
                fontSize: 17,
                color: "#92400E",
                marginLeft: 16,
                flex: 1,
                fontWeight: "500",
              }}
            >
              {t.reportIssue}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Source Info */}
        {lastUpdated && (
          <View
            style={{
              margin: 16,
              padding: 16,
              backgroundColor: "#F0F9FF",
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: "#1E40AF",
            }}
          >
            <Text
              style={{ fontSize: 13, color: "#1E40AF", textAlign: "center" }}
            >
              {t.lastUpdated}:{" "}
              {new Date(lastUpdated).toLocaleDateString("hi-IN")}{" "}
              {new Date(lastUpdated).toLocaleTimeString("hi-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: "#6B7280",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Data sourced from official Government APIs
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
