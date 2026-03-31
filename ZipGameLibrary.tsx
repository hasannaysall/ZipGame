import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 4; 
const TOTAL_NUMBERS = 8;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 40) / GRID_SIZE);
const PRIMARY_COLOR = "#BD1E59"; 
interface Point { r: number; c: number; x: number; y: number; }

export const ZipGame = () => {
  const [path, setPath] = useState<Point[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [targets, setTargets] = useState<Record<string, { r: number; c: number }>>({});

  
  const generateLevel = useCallback(() => {
    let newTargets: Record<string, { r: number; c: number }> = {};
    let fullPath: { r: number; c: number }[] = [];
    let r = Math.floor(Math.random() * GRID_SIZE);
    let c = Math.floor(Math.random() * GRID_SIZE);
    fullPath.push({ r, c });

    for (let i = 0; i < 100; i++) {
      const moves = [{dr:1,dc:0},{dr:-1,dc:0},{dr:0,dc:1},{dr:0,dc:-1}].sort(() => Math.random() - 0.5);
      for (let m of moves) {
        let nr = r + m.dr, nc = c + m.dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !fullPath.some(p => p.r === nr && p.c === nc)) {
          r = nr; c = nc; fullPath.push({ r, c }); break;
        }
      }
    }
    if (fullPath.length < TOTAL_NUMBERS + 5) return generateLevel();
    let indices: number[] = [0];
    while (indices.length < TOTAL_NUMBERS) {
      let idx = Math.floor(Math.random() * fullPath.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    indices.sort((a,b) => a-b).forEach((pIdx, i) => {
      newTargets[(i + 1).toString()] = fullPath[pIdx];
    });
    setTargets(newTargets); setPath([]); setNextNumber(1);
  }, []);

  useEffect(() => { generateLevel(); }, [generateLevel]);

  const handlePress = (r: number, c: number) => {
    
    if (path.some(p => p.r === r && p.c === c)) {
      const idx = path.findIndex(p => p.r === r && p.c === c);
      const newPath = path.slice(0, idx + 1);
      setPath(newPath);
      let maxN = 0;
      newPath.forEach(p => {
        const n = Object.keys(targets).find(k => targets[k].r === p.r && targets[k].c === p.c);
        if (n) maxN = Math.max(maxN, parseInt(n));
      });
      setNextNumber(maxN + 1 || 1);
      return;
    }

    const x = c * CELL_SIZE + CELL_SIZE / 2;
    const y = r * CELL_SIZE + CELL_SIZE / 2;
    const isAdj = path.length === 0 || (Math.abs(path[path.length-1].r - r) + Math.abs(path[path.length-1].c - c) === 1);

    if (isAdj) {
      const cellNum = Object.keys(targets).find(k => targets[k].r === r && targets[k].c === c);
      if (cellNum) {
        if (parseInt(cellNum) === nextNumber) {
          setNextNumber(nextNumber + 1);
          setPath([...path, { r, c, x, y }]);
        } else {
          Alert.alert("Hata", `Sıradaki sayı ${nextNumber} olmalı!`);
        }
      } else if (path.length > 0) {
        setPath([...path, { r, c, x, y }]);
      }
    }
  };

  useEffect(() => {
    if (nextNumber > TOTAL_NUMBERS) {
      Alert.alert("Tebrikler!", "Bölüm bitti.", [{ text: "Devam Et", onPress: generateLevel }]);
    }
  }, [nextNumber, generateLevel]);

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>Hedef: {nextNumber}</Text>
      <View style={[styles.board, { width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }]}>
        <Svg style={StyleSheet.absoluteFill}>
          {path.map((p, i) => i > 0 && <Line key={i} x1={path[i-1].x} y1={path[i-1].y} x2={p.x} y2={p.y} stroke={PRIMARY_COLOR} strokeWidth="12" strokeLinecap="round" />)}
        </Svg>
        <View style={styles.grid}>
          {Array.from({ length: GRID_SIZE }).map((_, r) => (
            <View key={r} style={{ flexDirection: 'row' }}>
              {Array.from({ length: GRID_SIZE }).map((_, c) => {
                const target = Object.keys(targets).find(k => targets[k].r === r && targets[k].c === c);
                const active = path.some(p => p.r === r && p.c === c);
                return (
                  <TouchableOpacity key={c} activeOpacity={1} onPress={() => handlePress(r, c)} style={[styles.cell, active && {backgroundColor: 'rgba(189,30,89,0.05)'}]}>
                    {target ? (
                      <View style={[styles.circle, active && styles.activeCircle]}>
                        <Text style={[styles.num, active && {color: '#fff'}]}>{target}</Text>
                      </View>
                    ) : active && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  infoText: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#334155' },
  board: { backgroundColor: '#F1F5F9', borderRadius: 12, overflow: 'hidden', elevation: 4 },
  grid: { flex: 1 },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderWidth: 0.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#94A3B8' },
  activeCircle: { backgroundColor: '#000', borderColor: '#000' },
  num: { fontWeight: 'bold', fontSize: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY_COLOR }
});