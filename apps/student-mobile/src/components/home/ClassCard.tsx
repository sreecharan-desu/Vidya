import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { SchoolClass } from '../../types/curriculum';
import { HoverCard } from '../common/HoverCard';

interface ClassCardProps {
  schoolClass: SchoolClass;
  isSelected?: boolean;
  onPress: () => void;
  horizontal?: boolean;
  variant?: 'grid' | 'horizontal';
}

const GRADE_THEMES: Record<
  number,
  { badgeBg: string; badgeText: string }
> = {
  6: { badgeBg: '#EAF5ED', badgeText: '#237346' }, // Soft sage green
  7: { badgeBg: '#E3F2F1', badgeText: '#186A67' }, // Soft mint teal
  8: { badgeBg: '#FBECE3', badgeText: '#B95D3F' }, // Warm peach (brand primary)
  9: { badgeBg: '#E4F0F9', badgeText: '#1C608B' }, // Soft ice blue
  10: { badgeBg: '#FCEAE7', badgeText: '#A83B28' }, // Soft coral
};

export const ClassCard: React.FC<ClassCardProps> = ({
  schoolClass,
  isSelected = false,
  onPress,
  horizontal = false,
  variant,
}) => {
  const isHorizontal = variant ? variant === 'horizontal' : horizontal;
  const gradeNum = schoolClass.grade || 8;
  const theme = GRADE_THEMES[gradeNum] || {
    badgeBg: '#FBECE3',
    badgeText: Colors.primary,
  };

  return (
    <HoverCard
      className={`rounded-[22px] p-[18px] justify-between shadow-sm ${
        isHorizontal ? 'w-[168px] min-h-[146px] mr-3' : 'w-full min-h-[146px]'
      } ${
        isSelected
          ? 'border-[2px] border-primary bg-surfaceSoft'
          : 'border border-border bg-white'
      }`}
      onPress={onPress}
      lift={-3}
    >
      {/* Top Row: Squircle Grade Badge & Selected Indicator */}
      <View className="flex-row items-center justify-between">
        <View
          style={{ backgroundColor: theme.badgeBg }}
          className="w-12 h-12 rounded-[16px] items-center justify-center"
        >
          <Text
            style={{ color: theme.badgeText }}
            className="font-manrope-extrabold text-xl"
          >
            {schoolClass.grade}
          </Text>
        </View>

        {isSelected ? (
          <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
            <MaterialIcons name="check" size={13} color={Colors.white} />
          </View>
        ) : null}
      </View>

      {/* Bottom Row: Title, Subtitle, and Diagonal Arrow */}
      <View className="flex-row items-end justify-between mt-4">
        <View className="flex-1 mr-2">
          <Text
            className={`font-manrope-extrabold text-base tracking-tight ${
              isSelected ? 'text-primaryDark' : 'text-textPrimary'
            }`}
          >
            {schoolClass.title}
          </Text>
          <Text
            className={`font-manrope-medium text-xs mt-0.5 ${
              isSelected ? 'text-primary' : 'text-textSecondary'
            }`}
          >
            Explore grade
          </Text>
        </View>

        <View className="w-8 h-8 rounded-full bg-softWarm border border-border items-center justify-center">
          <MaterialIcons name="north-east" size={16} color={Colors.primary} />
        </View>
      </View>
    </HoverCard>
  );
};
