import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp,
  TrendingDown,
  ChevronDown
} from 'lucide-react-native';

const DISTRICTS = [
  { id: 'raipur', name: 'Raipur' },
  { id: 'bilaspur', name: 'Bilaspur' },
  { id: 'durg', name: 'Durg' },
  { id: 'korba', name: 'Korba' },
  { id: 'rajnandgaon', name: 'Rajnandgaon' }
];

const MOCK_DATA = {
  raipur: {
    totalEmploymentDays: 2250000,
    paymentPercentage: 89.5,
    avgEmploymentPerFamily: 52,
    activeWorkers: 45632
  },
  bilaspur: {
    totalEmploymentDays: 1980000,
    paymentPercentage: 92.1,
    avgEmploymentPerFamily: 48,
    activeWorkers: 38924
  }
};

export default function Compare() {
  const insets = useSafeAreaInsets();
  const [selectedDistricts, setSelectedDistricts] = useState(['raipur', 'bilaspur']);
  const [showDropdown, setShowDropdown] = useState(false);

  const ComparisonMetric = ({ title, icon: Icon, data1, data2, unit = '', isPercentage = false }) => {
    const diff = data1 - data2;
    const diffPercentage = ((data1 - data2) / data2 * 100).toFixed(1);
    
    return (
      <View style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Icon size={20} color="#1E40AF" />
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: '#1F2937',
            marginLeft: 8
          }}>
            {title}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {/* District 1 */}
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
              Raipur
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
              {isPercentage ? `${data1}%` : data1.toLocaleString()}{unit}
            </Text>
          </View>
          
          {/* Comparison */}
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
            {diff > 0 ? (
              <TrendingUp size={16} color="#10B981" />
            ) : (
              <TrendingDown size={16} color="#EF4444" />
            )}
            <Text style={{ 
              fontSize: 12, 
              color: diff > 0 ? '#10B981' : '#EF4444',
              fontWeight: '600',
              marginTop: 2
            }}>
              {diff > 0 ? '+' : ''}{diffPercentage}%
            </Text>
          </View>
          
          {/* District 2 */}
          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
              Bilaspur
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
              {isPercentage ? `${data2}%` : data2.toLocaleString()}{unit}
            </Text>
          </View>
        </View>
        
        {/* Visual comparison bar */}
        <View style={{ marginTop: 12 }}>
          <View style={{ 
            flexDirection: 'row', 
            height: 8, 
            backgroundColor: '#F3F4F6',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <View style={{ 
              backgroundColor: '#1E40AF',
              flex: data1 / (data1 + data2),
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4
            }} />
            <View style={{ 
              backgroundColor: '#10B981',
              flex: data2 / (data1 + data2),
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4
            }} />
          </View>
        </View>
      </View>
    );
  };

  const data1 = MOCK_DATA.raipur;
  const data2 = MOCK_DATA.bilaspur;

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>
              Compare Districts
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
              Side-by-side performance comparison
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            style={{
              backgroundColor: '#F3F4F6',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 12, color: '#374151', marginRight: 4 }}>
              Change
            </Text>
            <ChevronDown size={14} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* District Headers */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ 
              backgroundColor: '#1E40AF',
              borderRadius: 8,
              padding: 12,
              flex: 1,
              marginRight: 8
            }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                Raipur
              </Text>
              <Text style={{ color: '#BFDBFE', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                Chhattisgarh
              </Text>
            </View>
            
            <Text style={{ 
              fontSize: 14, 
              color: '#6B7280',
              fontWeight: '600',
              paddingHorizontal: 8
            }}>
              VS
            </Text>
            
            <View style={{ 
              backgroundColor: '#10B981',
              borderRadius: 8,
              padding: 12,
              flex: 1,
              marginLeft: 8
            }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                Bilaspur
              </Text>
              <Text style={{ color: '#A7F3D0', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                Chhattisgarh
              </Text>
            </View>
          </View>
        </View>

        {/* Comparison Metrics */}
        <ComparisonMetric
          title="Total Employment Days"
          icon={Briefcase}
          data1={data1.totalEmploymentDays}
          data2={data2.totalEmploymentDays}
        />
        
        <ComparisonMetric
          title="Payment Percentage"
          icon={DollarSign}
          data1={data1.paymentPercentage}
          data2={data2.paymentPercentage}
          isPercentage={true}
        />
        
        <ComparisonMetric
          title="Avg Employment/Family"
          icon={Users}
          data1={data1.avgEmploymentPerFamily}
          data2={data2.avgEmploymentPerFamily}
          unit=" days"
        />
        
        <ComparisonMetric
          title="Active Workers"
          icon={Users}
          data1={data1.activeWorkers}
          data2={data2.activeWorkers}
        />

        {/* Summary */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginTop: 8,
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
            marginBottom: 12
          }}>
            Key Insights
          </Text>
          
          <View style={{ 
            backgroundColor: '#F0FDF4',
            borderLeftWidth: 4,
            borderLeftColor: '#10B981',
            padding: 12,
            borderRadius: 6,
            marginBottom: 8
          }}>
            <Text style={{ fontSize: 14, color: '#166534' }}>
              Bilaspur has a higher payment percentage (92.1% vs 89.5%)
            </Text>
          </View>
          
          <View style={{ 
            backgroundColor: '#EFF6FF',
            borderLeftWidth: 4,
            borderLeftColor: '#1E40AF',
            padding: 12,
            borderRadius: 6
          }}>
            <Text style={{ fontSize: 14, color: '#1E3A8A' }}>
              Raipur provides more total employment opportunities with 2.25M days vs 1.98M days
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}