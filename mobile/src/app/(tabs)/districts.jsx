import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Search, 
  Locate,
  ChevronRight,
  TrendingUp,
  Users
} from 'lucide-react-native';

const CHHATTISGARH_DISTRICTS = [
  { id: 'raipur', name: 'Raipur', state: 'Chhattisgarh', performance: 89.5, trend: '+8%' },
  { id: 'bilaspur', name: 'Bilaspur', state: 'Chhattisgarh', performance: 92.1, trend: '+12%' },
  { id: 'durg', name: 'Durg', state: 'Chhattisgarh', performance: 87.2, trend: '+5%' },
  { id: 'korba', name: 'Korba', state: 'Chhattisgarh', performance: 85.8, trend: '+3%' },
  { id: 'rajnandgaon', name: 'Rajnandgaon', state: 'Chhattisgarh', performance: 91.3, trend: '+15%' },
  { id: 'kondagaon', name: 'Kondagaon', state: 'Chhattisgarh', performance: 88.7, trend: '+7%' },
  { id: 'kabirdham', name: 'Kabirdham', state: 'Chhattisgarh', performance: 86.4, trend: '+4%' },
  { id: 'mahasamund', name: 'Mahasamund', state: 'Chhattisgarh', performance: 90.2, trend: '+9%' }
];

export default function Districts() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDistricts, setFilteredDistricts] = useState(CHHATTISGARH_DISTRICTS);
  const [selectedDistrict, setSelectedDistrict] = useState('raipur');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDistricts(CHHATTISGARH_DISTRICTS);
    } else {
      const filtered = CHHATTISGARH_DISTRICTS.filter(district =>
        district.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDistricts(filtered);
    }
  }, [searchQuery]);

  const handleLocationRequest = () => {
    Alert.alert(
      'Location Access',
      'This feature would use your GPS to detect your district automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Allow', onPress: () => {
          Alert.alert('Success', 'District detected: Raipur');
          setSelectedDistrict('raipur');
        }}
      ]
    );
  };

  const DistrictCard = ({ district, isSelected, onSelect }) => (
    <TouchableOpacity
      onPress={() => onSelect(district.id)}
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: isSelected ? 2 : 0,
        borderColor: isSelected ? '#1E40AF' : 'transparent'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={16} color="#6B7280" />
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#1F2937',
              marginLeft: 8
            }}>
              {district.name}
            </Text>
            {isSelected && (
              <View style={{
                backgroundColor: '#1E40AF',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 8
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                  SELECTED
                </Text>
              </View>
            )}
          </View>
          
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
            {district.state}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Users size={14} color="#10B981" />
            <Text style={{ 
              fontSize: 14, 
              color: '#374151',
              marginLeft: 4,
              marginRight: 12
            }}>
              Performance: {district.performance}%
            </Text>
            
            <TrendingUp size={12} color="#10B981" />
            <Text style={{ 
              fontSize: 12, 
              color: '#10B981',
              marginLeft: 4,
              fontWeight: '600'
            }}>
              {district.trend}
            </Text>
          </View>
        </View>
        
        <ChevronRight size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

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
            Select District
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Choose your district to view MGNREGA data
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Quick Access */}
        <TouchableOpacity
          onPress={handleLocationRequest}
          style={{
            backgroundColor: '#1E40AF',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Locate size={24} color="white" />
            <Text style={{ 
              color: 'white', 
              fontSize: 18, 
              fontWeight: '600',
              marginLeft: 12
            }}>
              Use My Location
            </Text>
          </View>
          <Text style={{ 
            color: '#BFDBFE', 
            fontSize: 14, 
            textAlign: 'center',
            marginTop: 4
          }}>
            अपने स्थान का उपयोग करें
          </Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 4,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Search size={20} color="#6B7280" style={{ marginLeft: 12 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search district... / जिला खोजें..."
            placeholderTextColor="#6B7280"
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 12,
              fontSize: 16,
              color: '#1F2937'
            }}
          />
        </View>

        {/* Instructions */}
        <View style={{
          backgroundColor: '#FEF3C7',
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: '#F59E0B'
        }}>
          <Text style={{ fontSize: 14, color: '#92400E', textAlign: 'center' }}>
            अपने जिले का MGNREGA प्रदर्शन देखें
          </Text>
          <Text style={{ fontSize: 12, color: '#A16207', textAlign: 'center', marginTop: 2 }}>
            View your district's MGNREGA performance
          </Text>
        </View>

        {/* Districts List */}
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#1F2937',
          marginBottom: 16
        }}>
          Chhattisgarh Districts ({filteredDistricts.length})
        </Text>

        {filteredDistricts.length === 0 ? (
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center'
          }}>
            <Search size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>
              No districts found
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>
              Try a different search term
            </Text>
          </View>
        ) : (
          filteredDistricts.map((district) => (
            <DistrictCard
              key={district.id}
              district={district}
              isSelected={selectedDistrict === district.id}
              onSelect={setSelectedDistrict}
            />
          ))
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={{
            backgroundColor: selectedDistrict ? '#10B981' : '#D1D5DB',
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            alignItems: 'center'
          }}
          disabled={!selectedDistrict}
          onPress={() => {
            const selected = CHHATTISGARH_DISTRICTS.find(d => d.id === selectedDistrict);
            Alert.alert('District Selected', `You have selected ${selected?.name}. This would navigate to the dashboard.`);
          }}
        >
          <Text style={{ 
            color: selectedDistrict ? 'white' : '#6B7280',
            fontSize: 18,
            fontWeight: '600'
          }}>
            View Dashboard
          </Text>
          <Text style={{ 
            color: selectedDistrict ? '#A7F3D0' : '#9CA3AF',
            fontSize: 14,
            marginTop: 4
          }}>
            डैशबोर्ड देखें
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}