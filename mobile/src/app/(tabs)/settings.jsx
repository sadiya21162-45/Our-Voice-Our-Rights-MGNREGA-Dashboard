import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Settings as SettingsIcon,
  Globe,
  Info,
  MessageSquare,
  Download,
  RefreshCw,
  ChevronRight,
  Check,
  Volume2,
  Moon,
  Sun,
  Bell,
  HelpCircle
} from 'lucide-react-native';

const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', englishName: 'Hindi' },
  { code: 'en', name: 'English', englishName: 'English' },
  { code: 'bho', name: 'भोजपुरी', englishName: 'Bhojpuri' },
  { code: 'cg', name: 'छत्तीसगढ़ी', englishName: 'Chhattisgarhi' }
];

export default function Settings() {
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const SettingsSection = ({ title, children }) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ 
        fontSize: 14, 
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 16
      }}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    rightElement,
    isLast = false 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#F3F4F6'
      }}
    >
      <Icon size={20} color="#6B7280" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '500' }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (showChevron && <ChevronRight size={16} color="#D1D5DB" />)}
    </TouchableOpacity>
  );

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        width: 48,
        height: 24,
        borderRadius: 12,
        backgroundColor: enabled ? '#10B981' : '#D1D5DB',
        padding: 2,
        justifyContent: 'center'
      }}
    >
      <View style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        alignSelf: enabled ? 'flex-end' : 'flex-start'
      }} />
    </TouchableOpacity>
  );

  const showLanguageSelector = () => {
    Alert.alert(
      'Select Language / भाषा चुनें',
      '',
      LANGUAGES.map(lang => ({
        text: `${lang.name} (${lang.englishName})`,
        onPress: () => {
          setSelectedLanguage(lang.code);
          Alert.alert('Language Changed', `Language changed to ${lang.englishName}`);
        }
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue / समस्या की रिपोर्ट करें',
      'This would open a form to report wage delays, work issues, or other problems with MGNREGA implementation.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => Alert.alert('Feature Coming Soon', 'Issue reporting form will be available in the next update.') }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About MGNREGA App',
      'This app helps rural citizens access and understand their district\'s MGNREGA performance data.\n\nVersion: 1.0.0\nDeveloped for the Government of India\n\nMGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) provides at least 100 days of wage employment to rural households.',
      [{ text: 'OK' }]
    );
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 16, 
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>
            Settings
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Customize your app experience
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences */}
        <SettingsSection title="Preferences">
          <SettingsItem
            icon={Globe}
            title="Language / भाषा"
            subtitle={`${currentLanguage?.name} (${currentLanguage?.englishName})`}
            onPress={showLanguageSelector}
          />
          
          <SettingsItem
            icon={Volume2}
            title="Audio Explanations"
            subtitle="Enable voice descriptions for metrics"
            onPress={() => setAudioEnabled(!audioEnabled)}
            showChevron={false}
            rightElement={<ToggleSwitch enabled={audioEnabled} onToggle={() => setAudioEnabled(!audioEnabled)} />}
          />
          
          <SettingsItem
            icon={Bell}
            title="Notifications"
            subtitle="Get updates about MGNREGA data"
            onPress={() => setNotifications(!notifications)}
            showChevron={false}
            rightElement={<ToggleSwitch enabled={notifications} onToggle={() => setNotifications(!notifications)} />}
            isLast
          />
        </SettingsSection>

        {/* Data & Sync */}
        <SettingsSection title="Data & Sync">
          <SettingsItem
            icon={RefreshCw}
            title="Refresh Data"
            subtitle="Last updated: 2 hours ago"
            onPress={() => Alert.alert('Refreshing Data', 'Fetching latest MGNREGA data...')}
          />
          
          <SettingsItem
            icon={Download}
            title="Offline Data"
            subtitle="Download for offline access"
            onPress={() => Alert.alert('Offline Data', 'This would download district data for offline use')}
            isLast
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support & Feedback">
          <SettingsItem
            icon={MessageSquare}
            title="Report Issue"
            subtitle="Report wage delays, work problems"
            onPress={handleReportIssue}
          />
          
          <SettingsItem
            icon={HelpCircle}
            title="Help & FAQ"
            subtitle="Learn how to use the app"
            onPress={() => Alert.alert('Help', 'Help documentation would be available here')}
          />
          
          <SettingsItem
            icon={Info}
            title="About MGNREGA"
            subtitle="Learn about the employment scheme"
            onPress={handleAbout}
            isLast
          />
        </SettingsSection>

        {/* App Info */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          margin: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: '#1F2937',
            textAlign: 'center',
            marginBottom: 8
          }}>
            MGNREGA Dashboard
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: 4
          }}>
            Version 1.0.0
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: '#9CA3AF',
            textAlign: 'center'
          }}>
            Government of India
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={{
          backgroundColor: '#FEF3C7',
          borderRadius: 8,
          padding: 12,
          margin: 16,
          borderLeftWidth: 4,
          borderLeftColor: '#F59E0B'
        }}>
          <Text style={{ fontSize: 12, color: '#92400E', textAlign: 'center' }}>
            Data sourced from official Government APIs. 
            For official complaints, visit your local MGNREGA office.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}