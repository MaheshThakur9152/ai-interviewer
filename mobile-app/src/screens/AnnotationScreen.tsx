import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, ActivityIndicator } from 'react-native';
import { Canvas, Path, Skia, SkPath, useCanvasRef, useImage, Image } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

interface PathWithColor {
    path: SkPath;
    color: string;
}

export default function AnnotationScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { imageUri } = route.params;
    const canvasRef = useCanvasRef();
    const skiaImage = useImage(imageUri);

    const [paths, setPaths] = useState<PathWithColor[]>([]);
    const [color, setColor] = useState('#FF453A'); // Default Apple Red
    const [currentPath, setCurrentPath] = useState<SkPath | null>(null);

    const panGesture = Gesture.Pan()
        .onBegin((e) => {
            const newPath = Skia.Path.Make();
            newPath.moveTo(e.x, e.y);
            setCurrentPath(newPath);
        })
        .onUpdate((e) => {
            if (currentPath) {
                currentPath.lineTo(e.x, e.y);
                setPaths((prev) => {
                    const lastIndex = prev.findIndex(p => p.path === currentPath);
                    if (lastIndex === -1) {
                        return [...prev, { path: currentPath, color }];
                    }
                    return [...prev];
                });
            }
        })
        .onEnd(() => {
            setCurrentPath(null);
        });

    const handleSave = async () => {
        const image = canvasRef.current?.makeImageSnapshot();
        if (image) {
            const data = image.encodeToBase64();
            const uri = `data:image/png;base64,${data}`;

            try {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                    // Sharing is often easier for testing
                    await Sharing.shareAsync(uri);
                    navigation.goBack();
                } else {
                    alert("Permission denied to save photo");
                }
            } catch (e) {
                console.error(e);
                alert("Failed to save or share image");
            }
        } else {
            alert("Failed to capture annotation");
        }
    };

    const handleUndo = () => {
        setPaths(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setPaths([]);
    };

    if (!skiaImage) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: 'white', marginTop: 10 }}>Loading Drawing Canvas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.headerBtn}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Annotate</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={[styles.headerBtn, { color: theme.colors.primary }]}>Done</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.canvasContainer}>
                <GestureDetector gesture={panGesture}>
                    <Canvas style={styles.canvas} ref={canvasRef}>
                        <Image
                            image={skiaImage}
                            x={0}
                            y={0}
                            width={width}
                            height={height * 0.7}
                            fit="contain"
                        />
                        {paths.map((p, index) => (
                            <Path
                                key={index}
                                path={p.path}
                                color={p.color}
                                style="stroke"
                                strokeWidth={4}
                                strokeJoin="round"
                                strokeCap="round"
                            />
                        ))}
                    </Canvas>
                </GestureDetector>
            </View>

            <View style={styles.toolbar}>
                <View style={styles.colorPalette}>
                    <TouchableOpacity style={[styles.colorCircle, { backgroundColor: '#FF453A' }]} onPress={() => setColor('#FF453A')} />
                    <TouchableOpacity style={[styles.colorCircle, { backgroundColor: '#30D158' }]} onPress={() => setColor('#30D158')} />
                    <TouchableOpacity style={[styles.colorCircle, { backgroundColor: '#0A84FF' }]} onPress={() => setColor('#0A84FF')} />
                    <TouchableOpacity style={[styles.colorCircle, { backgroundColor: '#FFFFFF' }]} onPress={() => setColor('#FFFFFF')} />
                </View>
                <View style={styles.divider} />
                <View style={styles.actionGroup}>
                    <TouchableOpacity onPress={handleUndo}>
                        <Text style={styles.actionText}>Undo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClear}>
                        <Text style={[styles.actionText, { color: theme.colors.destructive }]}>Clear</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loading: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    header: {
        height: 100,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: '#1C1C1E'
    },
    headerBtn: { color: '#fff', fontSize: 17 },
    title: { color: '#fff', fontSize: 18, fontWeight: '600' },
    canvasContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    canvas: { width: width, height: height * 0.7 },
    toolbar: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        backgroundColor: '#1C1C1E',
        paddingBottom: 20
    },
    colorPalette: { flexDirection: 'row', gap: 15 },
    colorCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#333' },
    divider: { width: 1, height: 40, backgroundColor: '#333' },
    actionGroup: { flexDirection: 'row', gap: 20 },
    actionText: { color: '#888', fontSize: 15, fontWeight: '500' }
});
