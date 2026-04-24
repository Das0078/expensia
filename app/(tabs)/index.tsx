import "@/global.css"
import { Link } from "expo-router";
import { Text, View, Image, FlatList } from "react-native";
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {styled} from 'nativewind';
import images from "@/constants/images";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER,  UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";
import { components } from "@/constants/theme";
const SafeAreaView = styled(RNSafeAreaView); // by tled wrap us nativewind can style it with className to safe area view and use it in app.tsx without importing nativewind in app.tsx and also can use className for styling it with nativewind

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const bottomContentInset =
    components.tabBar.height + Math.max(insets.bottom, components.tabBar.horizontalInset) + 12;

  const handleSubscriptionPress = (id: string) => {
    
  };
  return (
    <SafeAreaView className="flex-1  bg-background p-5">

      
    

      <FlatList
      className="flex-1"
      ListHeaderComponent={()=>(
<>
<View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-user-name">
            {HOME_USER.name}
          </Text>
        </View>
        <Image source={icons.add} className="home-add-icon" />
      </View>

      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
          <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD/YYYY')}</Text>
        </View>
      </View>

    <View className="mb-5">
      <ListHeading title="Upcoming"/>
      {/* <UpcomingSubscriptionCard data={UPCOMING_SUBSCRIPTIONS[0]}/> */}
      <FlatList
      keyExtractor={(item)=>item.id}
      data={UPCOMING_SUBSCRIPTIONS}
      renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
      horizontal
      showsHorizontalScrollIndicator={false}
      ListEmptyComponent={ <Text className="home-empty-state">No upcoming subscriptions yet.</Text> }
      />
        

    </View>
      <ListHeading title="All Subscription"/>

</>
      )}
      data={HOME_SUBSCRIPTIONS}
      keyExtractor={(item) => item.id}
      renderItem={({item}) => (
        <SubscriptionCard
        {...item}    
        expanded={expandedSubscriptionId === item.id}
        onPress={() => setExpandedSubscriptionId(prevId => prevId === item.id ? null : item.id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomContentInset, gap: 16 }}
      ListEmptyComponent={ <Text className="home-empty-state">No subscriptions found. Start adding some!</Text> }
      extraData={expandedSubscriptionId}
      />


    </SafeAreaView>
  );
}
