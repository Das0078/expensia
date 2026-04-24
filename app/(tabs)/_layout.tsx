import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS_BY_NAME = tabs.reduce<Record<string, AppTab>>((map, tab) => {
    map[tab.name] = tab;
    return map;
}, {});

const TabLayout = () => (
    <Tabs
        screenOptions={{
            headerShown: false,
        }}
        tabBar={(props) => <SlidingTabBar {...props} />}
    >
        {tabs.map((tab) => (
            <Tabs.Screen
                key={tab.name}
                name={tab.name}
                options={{
                    title: tab.title,
                }}
            />
        ))}
    </Tabs>
);

const SlidingTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const { width: windowWidth } = useWindowDimensions();
    const tabBar = components.tabBar;
    const [barWidth, setBarWidth] = useState(windowWidth - tabBar.horizontalInset * 2);
    const translateX = useRef(new Animated.Value(0)).current;
    const didInit = useRef(false);

    const tabRoutes = useMemo(
        () => state.routes.filter((route) => Boolean(TABS_BY_NAME[route.name])),
        [state.routes]
    );

    const activeTabIndex = useMemo(() => {
        const activeRoute = state.routes[state.index];
        const index = tabRoutes.findIndex((route) => route.key === activeRoute?.key);
        return index >= 0 ? index : 0;
    }, [state.index, state.routes, tabRoutes]);

    const itemWidth = tabRoutes.length > 0 ? barWidth / tabRoutes.length : 0;
    const indicatorOffset = Math.max((itemWidth - tabBar.iconFrame) / 2, 0);
    const targetX = activeTabIndex * itemWidth + indicatorOffset;

    useEffect(() => {
        if (!itemWidth) return;

        if (!didInit.current) {
            translateX.setValue(targetX);
            didInit.current = true;
            return;
        }

        Animated.timing(translateX, {
            toValue: targetX,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [itemWidth, targetX, translateX]);

    return (
        <View
            onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                if (Math.abs(width - barWidth) > 0.5) setBarWidth(width);
            }}
            style={[
                styles.tabBarContainer,
                {
                    bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                    height: tabBar.height,
                    left: tabBar.horizontalInset,
                    right: tabBar.horizontalInset,
                    borderRadius: tabBar.radius,
                    backgroundColor: colors.primary,
                },
            ]}
        >
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.activePill,
                    {
                        width: tabBar.iconFrame,
                        height: tabBar.iconFrame,
                        borderRadius: tabBar.iconFrame / 2,
                        backgroundColor: colors.accent,
                        top: (tabBar.height - tabBar.iconFrame) / 2,
                        transform: [{ translateX }],
                    },
                ]}
            />

            {tabRoutes.map((route, index) => {
                const tab = TABS_BY_NAME[route.name];
                if (!tab) return null;

                const isFocused = activeTabIndex === index;
                const options = descriptors[route.key]?.options;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name as never);
                    }
                };

                return (
                    <Pressable
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options?.tabBarAccessibilityLabel}
                        testID={options?.tabBarButtonTestID}
                        onPress={onPress}
                        onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
                        style={[
                            styles.tabButton,
                            {
                                width: itemWidth,
                                height: tabBar.height,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.iconWrap,
                                {
                                    width: tabBar.iconFrame,
                                    height: tabBar.iconFrame,
                                },
                            ]}
                        >
                            <Image
                                source={tab.icon}
                                contentFit="contain"
                                style={[
                                    styles.icon,
                                    {
                                        opacity: isFocused ? 1 : 0.72,
                                        transform: [{ scale: isFocused ? 1 : 0.96 }],
                                    },
                                ]}
                            />
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 0,
        elevation: 0,
    },
    activePill: {
        position: "absolute",
    },
    tabButton: {
        alignItems: "center",
        justifyContent: "center",
    },
    iconWrap: {
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        width: 24,
        height: 24,
    },
});

export default TabLayout;
