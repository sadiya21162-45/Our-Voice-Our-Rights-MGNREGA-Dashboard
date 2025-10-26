import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioRecorder, RecordingPresets, useAudioRecorderState, requestRecordingPermissionsAsync } from 'expo-audio';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import { 
  MessageSquare,
  Phone,
  Mic,
  Square,
  Play,
  ArrowLeft,
  Send,
  AlertTriangle,
  DollarSign,
  Briefcase,
  Shield,
  Users,
  CheckCircle,
  X,
  Volume2
} from 'lucide-react-native';

const TRANSLATIONS = {
  en: {
    title: 'Report Issue',
    subtitle: 'Report problems with wages, work quality, or other concerns',
    issueType: 'What is the problem?',
    wageDelay: 'Wage Payment Delay',
    wageDelayDesc: 'Your wages are delayed beyond the promised date',
    workQuality: 'Work Quality Issues',
    workQualityDesc: 'Problems with work conditions or materials',
    corruption: 'Corruption or Unfair Practices',
    corruptionDesc: 'Report corruption or unfair treatment',
    other: 'Other Issues',
    otherDesc: 'Any other MGNREGA related problems',
    description: 'Describe the problem',
    descriptionPlaceholder: 'Please explain the issue in detail...',
    voiceNote: 'Record Voice Note (Optional)',
    voiceNotePlaceholder: 'You can record your complaint instead of typing',
    contactNumber: 'Contact Number (Optional)',
    contactPlaceholder: 'Enter your mobile number',
    submitReport: 'Submit Report',
    submitting: 'Submitting...',
    selectDistrict: 'Select Your District',
    recording: 'Recording...',
    stopRecording: 'Stop Recording',
    playRecording: 'Play Recording',
    discardRecording: 'Discard',
    useRecording: 'Use This Recording',
    reportSubmitted: 'Report Submitted',
    thankYou: 'Thank you for your report. It will be reviewed by authorities.',
    reportId: 'Report ID',
    anonymous: 'Submit Anonymously',
    includeContact: 'Include Contact for Follow-up'
  },
  hi: {
    title: 'समस्या की रिपोर्ट करें',
    subtitle: 'मजदूरी, काम की गुणवत्ता या अन्य समस्याओं की रिपोर्ट करें',
    issueType: 'समस्या क्या है?',
    wageDelay: 'मजदूरी में देरी',
    wageDelayDesc: 'आपकी मजदूरी वादे की तारीख से देर हो रही है',
    workQuality: 'काम की गुणवत्ता की समस्या',
    workQualityDesc: 'काम की स्थिति या सामग्री में समस्या',
    corruption: 'भ्रष्टाचार या अनुचित व्यवहार',
    corruptionDesc: 'भ्रष्टाचार या अनुचित व्यवहार की रिपोर्ट करें',
    other: 'अन्य समस्याएं',
    otherDesc: 'कोई भी अन्य MGNREGA संबंधी समस्या',
    description: 'समस्या का विवरण दें',
    descriptionPlaceholder: 'कृपया समस्या का विस्तार से वर्णन करें...',
    voiceNote: 'आवाज रिकॉर्ड करें (वैकल्पिक)',
    voiceNotePlaceholder: 'आप टाइप करने के बजाय अपनी शिकायत रिकॉर्ड कर सकते हैं',
    contactNumber: 'संपर्क नंबर (वैकल्पिक)',
    contactPlaceholder: 'अपना मोबाइल नंबर दर्ज करें',
    submitReport: 'रिपोर्ट जमा करें',
    submitting: 'जमा कर रहे हैं...',
    selectDistrict: 'अपना जिला चुनें',
    recording: 'रिकॉर्डिंग...',
    stopRecording: 'रिकॉर्डिंग बंद करें',
    playRecording: 'रिकॉर्डिंग सुनें',
    discardRecording: 'रिकॉर्डिंग हटाएं',
    useRecording: 'यह रिकॉर्डिंग उपयोग करें',
    reportSubmitted: 'रिपोर्ट जमा हो गई',
    thankYou: 'आपकी रिपोर्ट के लिए धन्यवाद। इसकी अधिकारियों द्वारा समीक्षा की जाएगी।',
    reportId: 'रिपोर्ट आईडी',
    anonymous: 'बिना नाम के भेजें',
    includeContact: 'फॉलो-अप के लिए संपर्क शामिल करें'
  }
};

const ISSUE_TYPES = [
  {
    id: 'wage_delay',
    icon: DollarSign,
    color: '#EF4444'
  },
  {
    id: 'work_quality',
    icon: Briefcase,
    color: '#F59E0B'
  },
  {
    id: 'corruption',
    icon: Shield,
    color: '#DC2626'
  },
  {
    id: 'other',
    icon: Users,
    color: '#6B7280'
  }
];

const AVAILABLE_DISTRICTS = [
  { id: 1, name: 'Raipur' },
  { id: 2, name: 'Bilaspur' },
  { id: 3, name: 'Korba' },
  { id: 4, name: 'Durg' }
];

export default function ReportIssue() {
  const insets = useSafeAreaInsets();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [selectedDistrict, setSelectedDistrict] = useState(AVAILABLE_DISTRICTS[0]);
  const [selectedIssueType, setSelectedIssueType] = useState(null);
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reportId, setReportId] = useState('');
  const [includeContact, setIncludeContact] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const handleStartRecording = async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Microphone permission is needed to record voice notes.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setShowRecordingModal(true);
  };

  const handleRecord = async () => {
    if (recorderState.isRecording) {
      await recorder.stop();
      setHasRecording(true);
    } else {
      await recorder.prepareToRecordAsync();
      recorder.record();
    }
  };

  const handleDiscardRecording = () => {
    setHasRecording(false);
    setShowRecordingModal(false);
  };

  const handleUseRecording = () => {
    setShowRecordingModal(false);
  };

  const submitReport = async () => {
    if (!selectedIssueType) {
      Alert.alert('Error', 'Please select the type of issue');
      return;
    }

    if (!description.trim() && !hasRecording) {
      Alert.alert('Error', 'Please provide a description or voice recording');
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        districtId: selectedDistrict.id,
        issueType: selectedIssueType,
        description: description.trim(),
        voiceNoteUrl: hasRecording ? recorder.uri : null,
        contactNumber: includeContact ? contactNumber : null
      };

      const response = await fetch('/api/issue-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setReportId(result.reportId);
          setShowSuccessModal(true);
          
          // Reset form
          setSelectedIssueType(null);
          setDescription('');
          setContactNumber('');
          setHasRecording(false);
          setIncludeContact(false);
        } else {
          throw new Error(result.error);
        }
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Submission Failed',
        'There was an error submitting your report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const IssueTypeCard = ({ issueType }) => {
    const issueConfig = ISSUE_TYPES.find(type => type.id === issueType.id);
    const Icon = issueConfig?.icon || AlertTriangle;
    const color = issueConfig?.color || '#6B7280';
    const isSelected = selectedIssueType === issueType.id;

    return (
      <TouchableOpacity
        onPress={() => setSelectedIssueType(issueType.id)}
        style={{
          backgroundColor: isSelected ? color + '15' : 'white',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? color : '#E5E7EB',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{
            backgroundColor: color + '15',
            borderRadius: 12,
            padding: 12,
            marginRight: 16
          }}>
            <Icon size={24} color={color} />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: 6
            }}>
              {t[issueType.titleKey]}
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              lineHeight: 20
            }}>
              {t[issueType.descKey]}
            </Text>
          </View>
          
          {isSelected && (
            <CheckCircle size={24} color={color} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => {/* Navigate back */}}
            style={{
              backgroundColor: '#F3F4F6',
              borderRadius: 12,
              padding: 8,
              marginRight: 16
            }}
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937' }}>
              {t.title}
            </Text>
          </View>
        </View>
        
        <Text style={{ fontSize: 16, color: '#6B7280' }}>
          {t.subtitle}
        </Text>
      </View>

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20, padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Issue Type Selection */}
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#1F2937',
            marginBottom: 16
          }}>
            {t.issueType}
          </Text>

          {[
            { id: 'wage_delay', titleKey: 'wageDelay', descKey: 'wageDelayDesc' },
            { id: 'work_quality', titleKey: 'workQuality', descKey: 'workQualityDesc' },
            { id: 'corruption', titleKey: 'corruption', descKey: 'corruptionDesc' },
            { id: 'other', titleKey: 'other', descKey: 'otherDesc' }
          ].map((issueType) => (
            <IssueTypeCard key={issueType.id} issueType={issueType} />
          ))}

          {/* Description */}
          {selectedIssueType && (
            <>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#1F2937',
                marginTop: 24,
                marginBottom: 16
              }}>
                {t.description}
              </Text>

              <TextInput
                multiline
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
                placeholder={t.descriptionPlaceholder}
                placeholderTextColor="#9CA3AF"
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 20,
                  fontSize: 16,
                  color: '#1F2937',
                  textAlignVertical: 'top',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  marginBottom: 20
                }}
              />

              {/* Voice Note Option */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Volume2 size={20} color="#1E40AF" />
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1F2937',
                    marginLeft: 12
                  }}>
                    {t.voiceNote}
                  </Text>
                </View>

                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                  marginBottom: 16,
                  lineHeight: 20
                }}>
                  {t.voiceNotePlaceholder}
                </Text>

                <TouchableOpacity
                  onPress={handleStartRecording}
                  style={{
                    backgroundColor: hasRecording ? '#10B981' : '#1E40AF',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Mic size={20} color="white" />
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 12
                  }}>
                    {hasRecording ? 'Recording Complete ✓' : 'Record Voice Note'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Contact Toggle */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}>
                <TouchableOpacity
                  onPress={() => setIncludeContact(!includeContact)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: includeContact ? 16 : 0
                  }}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: includeContact ? '#1E40AF' : 'transparent',
                    borderWidth: includeContact ? 0 : 2,
                    borderColor: '#D1D5DB',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {includeContact && <CheckCircle size={16} color="white" />}
                  </View>
                  
                  <Text style={{
                    fontSize: 16,
                    color: '#1F2937',
                    marginLeft: 12,
                    flex: 1
                  }}>
                    {t.includeContact}
                  </Text>
                </TouchableOpacity>

                {includeContact && (
                  <TextInput
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    placeholder={t.contactPlaceholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: '#1F2937'
                    }}
                  />
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={submitReport}
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? '#D1D5DB' : '#10B981',
                  borderRadius: 16,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10
                }}
              >
                {isSubmitting ? (
                  <Text style={{ color: '#6B7280', fontSize: 18, fontWeight: '600' }}>
                    {t.submitting}
                  </Text>
                ) : (
                  <>
                    <Send size={20} color="white" />
                    <Text style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: '600',
                      marginLeft: 12
                    }}>
                      {t.submitReport}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingAnimatedView>

      {/* Voice Recording Modal */}
      <Modal
        visible={showRecordingModal}
        transparent={true}
        animationType="slide"
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: insets.bottom + 24
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937' }}>
                {t.voiceNote}
              </Text>
              <TouchableOpacity onPress={handleDiscardRecording}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <TouchableOpacity
                onPress={handleRecord}
                style={{
                  backgroundColor: recorderState.isRecording ? '#EF4444' : '#1E40AF',
                  borderRadius: 64,
                  padding: 32,
                  marginBottom: 16
                }}
              >
                {recorderState.isRecording ? (
                  <Square size={32} color="white" />
                ) : (
                  <Mic size={32} color="white" />
                )}
              </TouchableOpacity>

              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1F2937',
                textAlign: 'center'
              }}>
                {recorderState.isRecording ? t.recording : hasRecording ? 'Recording Complete' : 'Tap to Record'}
              </Text>

              {recorderState.isRecording && (
                <Text style={{
                  fontSize: 16,
                  color: '#EF4444',
                  marginTop: 8
                }}>
                  {Math.floor(recorderState.currentTime)}s
                </Text>
              )}
            </View>

            {hasRecording && (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={handleDiscardRecording}
                  style={{
                    flex: 1,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
                    {t.discardRecording}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleUseRecording}
                  style={{
                    flex: 1,
                    backgroundColor: '#10B981',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                    {t.useRecording}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            maxWidth: 400,
            width: '100%'
          }}>
            <CheckCircle size={64} color="#10B981" />
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1F2937',
              marginTop: 16,
              marginBottom: 8,
              textAlign: 'center'
            }}>
              {t.reportSubmitted}
            </Text>

            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 16,
              lineHeight: 24
            }}>
              {t.thankYou}
            </Text>

            {reportId && (
              <View style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                padding: 12,
                marginBottom: 24
              }}>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                  {t.reportId}: #{reportId}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowSuccessModal(false)}
              style={{
                backgroundColor: '#1E40AF',
                borderRadius: 12,
                paddingHorizontal: 32,
                paddingVertical: 16
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}